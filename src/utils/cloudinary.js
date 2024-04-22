/* This file will handle case when we have file on our local server (db) and from there we 
are uploading it to cloudinary and removing it from local. */

// fs is file system in node.js

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return;

        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        //file uploaded successfully
        console.log("File uploaded successfully", response.url);
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        /* instead of writing conventional error statement why we are do this is suppose if we
            are not able to upload file to cloudinary a lot of junk (files) will be saved on 
            local and we don't want that so unlink it from local using fs.
        */
        console.log("Error in cloudinary: ", error);
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadCloudinary };
