import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { Assignment } from "../models/assignment.models.js"
import { Photo } from "../models/photo.models.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js'


const getAllAssignment = asyncHandler(async (req, res) => {
    const { subjectId } = req.params

    if(!subjectId) {
        throw new ApiError(400, "Subject ID is required")
    }

    const assignments = await Assignment.find({ subject: subjectId })

    if(!assignments) {
        throw new ApiError(500, "Failed to get assignments from database")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, assignments, "Successfully get assignments")
    )
})

const addAssignment = asyncHandler(async (req, res) => {
    const { number, subjectId, deadline } = req.body

    if (!number || !subjectId || !deadline) {
        throw new ApiError(400, "Missing required fields")
    }

    const existing = await Assignment.findOne({ number: number, subject: subjectId })
    if (existing) {
        throw new ApiError(400, "Assignment already exists")
    }

    const assignment = await Assignment.create({
        number,
        deadline,
        subject: subjectId
    })

    if (!assignment) {
        throw new ApiError(500, "Failed to create assignment in database")
    }

    res
        .status(201)
        .json(
            new ApiResponse(201, assignment, "Successfully create assignment")
        )
})

const uploadAssignment = asyncHandler(async (req, res, next) => {
    const { assignmentId } = req.body

    if (!assignmentId) {
        throw new ApiError(400, "Assignment ID is required")
    }

    if (!req.file) {
        throw new ApiError(400, "File not found")
    }

    const localPath = req.file.path
    if (!localPath) {
        throw new ApiError(500, "File localpath not found")
    }

    const assignment = await Assignment.findById(assignmentId)
    
    if (!assignment) {
        throw new ApiError(400, "Assignment not found")
    }

    const photo = await uploadOnCloudinary(localPath);

    if (!photo) {
        throw new ApiError(500, "Cannot upload file")
    }

    const saveRes = await Photo.create({
        name: photo.display_name,
        subject: assignment.subject,
        width: photo.width,
        height: photo.height,
        url: photo.url,
        type: "Assignment",
        typeId: assignment._id
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

    if(!typeId) {
        throw new ApiError(400, "Assignment ID is required")
    }

    const assignment = await Assignment.findById(typeId)

    if(!assignment) {
        throw new ApiError(400, "Assignment not found")
    }

    const photos = await Photo.find({typeId: typeId, type: "Assignment"})

    if(!photos) {
        res.status(404).json(new ApiResponse(404, [], "Photos not found"))
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, photos, "Get photos successfully")
    )
})

export {
    addAssignment,
    uploadAssignment,
    getAllAssignment,
    getAllPhotos
}