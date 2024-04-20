import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    const { fullname, username, email, password } = req.body;

    // validation - not empty
    if (
        [fullname, username, email, password].some((field) => field.trim == "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    // check if user already exist: username, email
    const existedUser = User.find({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exist");
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

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

export { registerUser };
