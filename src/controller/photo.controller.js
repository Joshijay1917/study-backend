import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const uploadPhotos = asyncHandler(async (req, res) => {
    if(!req.file) {
        throw new ApiError(404, "File not found")
    }

    const localPath = req.file.path

    if(!localPath) {
        throw new ApiError(500, "File localpath not found")
    }

    const photo = await uploadOnCloudinary(localPath);

    if(!photo) {
        throw new ApiError(500, "Cannot upload file")
    }

    res.status(200).json(new ApiResponse(200, photo, "Successfully upload photo on cloudinary"))
})

export {
    uploadPhotos
}