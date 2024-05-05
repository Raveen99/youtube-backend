import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    const { fullname, username, email, password } = req.body;

    // validation - not empty
    if (
        [fullname, username, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }
    // check if user already exist: username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exist");
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadCloudinary(avatarLocalPath);
    const coverImage = await uploadCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    // create user object - for entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    // remove password and refresh token field from response
    const isUserCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // check for user creation
    if (!isUserCreated) {
        throw new ApiError(500, "Something went wrong while registring user");
    }

    // return response
    return res
        .status(201)
        .json(
            new ApiResponse(200, isUserCreated, "User Registered Successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // data from req body
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username and password is required");
    }
    // username or email is required
    //if (!username || !email) {
    //    throw new ApiError(400, "username or email is required");
    // }

    // find user on username or email
    const user = await User.findOne({
        $or: [{ username }, { email }],
    });
    console.log("User logged in: ", user);
    if (!user) {
        throw new ApiError(404, "No user found");
    }

    // pawword is correct or not
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // access and refresh token to user send in cookies
    const { accessToken, refreshToken } = await generateTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User loggedIn successfully"
            )
        );
});

/* 
  Logic for logging out user:
  1. Remove cookies for user.
  2. Remove refresh token for user.
*/

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out"));
});

const updateAccessToken = asyncHandler(async (req, res) => {
    // collect refresh token from user and check whether there is access token or not
    const incomingRefreshToken =
        req.cookie.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        //verify token and get it in decoded format
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        console.log("Decode Token in refresh Endpoint: ", decodedToken);

        //From decoded token we will get user id and we can use this id to find user from mongoDb.
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token!");
        }
        //Now check whether save user token from db and the token which we get from user is same or not. If not throw error.
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used!");
        }

        //If token is same then generate new access and refresh Token and send response.
        const { newAccessToken, newRefreshToken } = await generateTokens(
            user?._id
        );

        const options = {
            httpOnly: true,
            secure: true,
        };

        res.status(201)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                    },
                    "Access Token is updated!"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token!");
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    //get fields for user aka. req.body
    const { oldPassword, newPassword } = req.body;

    /*If user is able to changePassowrd then it means user is logged in and we can get user id
    from body as we have auth middleware running and get user info from db.
    */
    const user = await User.findById(req.user._id);

    // check whether old password is correct or not.
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    //save password and send response.
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Updated successfully"));
});

const getCurrentUser = asyncHandler(async (res, req) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (res, req) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are mandatory");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const localAvatarPath = req.files?.url;
    if (!localAvatarPath) {
        throw new ApiError(400, "Avatar File is missing");
    }

    const avatar = await uploadCloudinary(localAvatarPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (res, req) => {
    const localCoverPath = req.files?.url;
    if (!localCoverPath) {
        throw new ApiError(400, "Cover Image is missing");
    }

    const coverImage = await uploadCloudinary(localCoverPath);
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading cover image");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (res, req) => {
    const { username } = req.params;

    if (!username.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "User channel fetched successfully"
            )
        );
});

export {
    registerUser,
    loginUser,
    logOutUser,
    updateAccessToken,
    updatePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
};
