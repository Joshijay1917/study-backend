import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { LabManual } from "../models/labManual.models.js"
import { Photo } from "../models/photo.models.js";

const addLabManual = asyncHandler(async (req, res) => {
    const { name, subjectId } = req.body

    if (!name || !subjectId) {
        throw new ApiError(400, "Missing required fields")
    }

    const labManual = await LabManual.create({
        name,
        subject: subjectId
    })

    if (!labManual) {
        throw new ApiError(500, "Failed to create labManual in database")
    }

    res
        .status(201)
        .json(
            new ApiResponse(201, labManual, "Successfully create labManual")
        )
})

const uploadLab = asyncHandler(async (req, res) => {
    const { name } = req.body

    if (!name) {
        throw new ApiError(400, "Lab Manual name is required")
    }

    if (!req.file) {
        throw new ApiError(400, "File not found")
    }

    const localPath = req.file.path
    if (!localPath) {
        throw new ApiError(500, "File localpath not found")
    }

    const labmanual = await LabManual.findOne({ name })
    if (!labmanual) {
        throw new ApiError("Sorry cannot find labmanual!!")
    }

    const photo = await uploadOnCloudinary(localPath);

    if (!photo) {
        throw new ApiError(500, "Cannot upload file")
    }

    const saveRes = await Photo.create({
        name: photo.display_name,
        subject: labmanual.subject,
        width: photo.width,
        height: photo.height,
        url: photo.url,
        type: "LabManual",
        typeId: labmanual._id
    })

    if (!saveRes) {
        throw new ApiError(500, "Failed to save in database")
    }

    res
    .status(201)
    .json(
        new ApiResponse(201, saveRes, "Successfully saved in database")
    )
})

export {
    addLabManual,
    uploadLab
}