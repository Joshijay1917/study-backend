import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

const uploadOnCloudinary = async (localPath) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    })

    try {
        if (!localPath) return null;

        const response = await cloudinary.uploader.upload(localPath, {
            resource_type: "auto"
        })

        fs.unlinkSync(localPath)
        return response;
    } catch (error) {
        console.log("Cloudinary Upload Error ", error);
        fs.unlinkSync(localPath)
        return null
    }
}

const deleteItemOnCloudinary = async (publicId) => {
    try {
        if(!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId);
        
        return response;
    } catch (error) {
        console.error("Cloudinary failed to delete photo!!! Error : ", error)
        return null;
    }
}

export { uploadOnCloudinary, deleteItemOnCloudinary }