import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

/* This middleware is designed to confirm that whether user is logged in or not. Then only 
  we will be able to logout user.
*/

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        /* Reasnon why we are checking header is user might be using mobile application. So, in that case
  data is passed in header. */
        console.log("cookies: ", req.cookies);
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        console.log("Token: ", token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        //now we need to decode it as it is encryted by jwt
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Decode Toke: ", decodedToken);

        //get user from db but remove password and refreshToken
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // passing user info to req so for logging user out we have user details/
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.messgae || "Invalid Access Token");
    }
});
