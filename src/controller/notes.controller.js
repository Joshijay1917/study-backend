import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { Note } from "../models/notes.models.js"
import { Photo } from "../models/photo.models.js";

const getAllNotes = asyncHandler(async (req, res) => {

    const notes = await Note.find();

    if(!notes) {
        throw new ApiError(500, "Failed to get notes from database")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, notes, "Get all notes successfully")
    )
})

const addNotes = asyncHandler(async (req, res) => {
    const { name, subjectId, unit } = req.body

    if (!name || !subjectId || !unit) {
        throw new ApiError(400, "Missing required fields")
    }

    const existing = await Note.findOne({ unit })
    if (existing) {
        throw new ApiError(400, "Notes already exists")
    }

    const note = await Note.create({
        name,
        subject: subjectId,
        unit
    })

    if (!note) {
        throw new ApiError(500, "Failed to create Note in database")
    }

    res
        .status(201)
        .json(
            new ApiResponse(201, "Successfully create note")
        )
})

const uploadNotes = asyncHandler(async (req, res) => {
    const { unit } = req.body

    if (!unit) {
        throw new ApiError(400, "Required fields not found!")
    }
    
    if(!req.file) {
        throw new ApiError(400, "File not found")
    }

    const localPath = req.file.path

    if(!localPath) {
        throw new ApiError(500, "File localpath not found")
    }

    const note = await Note.findOne({ unit })
    if(!note) {
        throw new ApiError(400, "Notes for this unit not found")
    }

    const photo = await uploadOnCloudinary(localPath);

    if(!photo) {
        throw new ApiError(500, "Cannot upload file")
    }

    const saveRes = await Photo.create({
        name: photo.display_name,
        subject: note.subject,
        width: photo.width,
        height: photo.height,
        url: photo.url,
        type: "Note",
        typeId: note._id
    })

    if(!saveRes) {
        throw new ApiError(500, "Failed to save in database")
    }

    res
    .status(201)
    .json(
        new ApiResponse(201, saveRes, "Successfully saved in database")
    )
})

export {
    addNotes,
    uploadNotes,
    getAllNotes
}