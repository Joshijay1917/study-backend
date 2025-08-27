import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { Assignment } from "../models/assignment.models.js"
import { Photo } from "../models/photo.models.js";

const addAssignment = asyncHandler(async (req, res) => {
    const { number, subjectId, deadline } = req.body

    if (!number || !subjectId || !deadline) {
        throw new ApiError(400, "Missing required fields")
    }

    const existing = await Assignment.findOne({ number })
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

const uploadAssignment = asyncHandler(async (req, res) => {
    const { number } = req.body

    if (!number) {
        throw new ApiError(400, "Assignment number is required")
    }

    if (!req.file) {
        throw new ApiError(400, "File not found")
    }

    const localPath = req.file.path
    if (!localPath) {
        throw new ApiError(500, "File localpath not found")
    }

    const assignment = await Assignment.findOne({ number })
    if (!assignment) {
        throw new ApiError(400, "Assignment " + number + " not found")
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

    res
    .status(201)
    .json(
        new ApiResponse(201, saveRes, "Successfully saved in database")
    )
})

export {
    addAssignment,
    uploadAssignment
}