import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { LabManual } from "../models/labManual.models.js"
import { Photo } from "../models/photo.models.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js'

const getAllLabmanuals = asyncHandler(async (req, res) => {
    const { subjectId } = req.params

    if (!subjectId) {
        throw new ApiError(400, "Subject ID is required")
    }

    const labs = await LabManual.find({ subject: subjectId })

    if (!labs) {
        throw new ApiError(500, "Failed to get lab manuals from database")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, labs, "Successfully get lab manuals")
        )
})

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

const uploadLab = asyncHandler(async (req, res, next) => {
    const { labmanualId } = req.body

    if (!labmanualId) {
        throw new ApiError(400, "Lab Manual ID is required")
    }

    if (!req.file) {
        throw new ApiError(400, "File not found")
    }

    const localPath = req.file.path
    if (!localPath) {
        throw new ApiError(500, "File localpath not found")
    }

    const labmanual = await LabManual.findById(labmanualId)
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

     req.uploadData = {
        ...saveRes
    }

    next();
})

const getAllPhotos = asyncHandler(async (req, res) => {
    const { typeId } = req.params

    if (!typeId) {
        throw new ApiError(400, "Lab Manual ID is required")
    }

    const labmanual = await LabManual.findById(typeId)

    if (!labmanual) {
        throw new ApiError(400, "Lab Manual not found")
    }

    const photos = await Photo.find({ typeId: typeId, type: "LabManual" })

    if (!photos) {
        res.status(200).json(new ApiResponse(404, [], "Photos not found"))
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, photos, "Get photos successfully")
    )
})

export {
    addLabManual,
    uploadLab,
    getAllLabmanuals,
    getAllPhotos
}