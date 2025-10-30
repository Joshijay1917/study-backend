import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { Note } from "../models/notes.models.js"
import { Photo } from "../models/photo.models.js";
import { deleteItemOnCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js'

const getAllNotes = asyncHandler(async (req, res) => {
    const { subjectId } = req.params

    if (!subjectId) {
        throw new ApiError(400, "Subject ID is required")
    }

    const notes = await Note.find({ subject: subjectId });

    if (!notes) {
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

    const existing = await Note.findOne({ unit: unit, subject: subjectId })
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
            new ApiResponse(201, note, "Successfully create note")
        )
})

const uploadNotes = asyncHandler(async (req, res, next) => {
    const { notesId } = req.body

    if (!notesId) {
        throw new ApiError(400, "Required fields not found!")
    }

    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "File not found")
    }

    const note = await Note.findById(notesId)
    if (!note) {
        throw new ApiError(400, "Notes for this unit not found")
    }

    const uploadedPhotos = [];

    const uploadPromises = req.files.map(async (file) => {
        const localPath = file.path
        if (!localPath) {
            throw new ApiError(500, "File localpath not found")
        }

        const photo = await uploadOnCloudinary(localPath);
        if (!photo) {
            throw new ApiError(500, "Cannot upload file")
        }

        const saveRes = await Photo.create({
            name: photo.display_name,
            subject: note.subject,
            width: photo.width,
            height: photo.height,
            url: photo.url,
            public_id: photo.public_id,
            type: "Note",
            typeId: note._id
        })

        if (!saveRes) {
            throw new ApiError(500, "Failed to save in database")
        }

        return saveRes;
    })

    const results = await Promise.all(uploadPromises)

    for (const r of results) {
        if (r) uploadedPhotos.push(r)
    }

    if (uploadedPhotos.length === 0) {
        throw new ApiError(500, "No photos were uploaded successfully");
    }

    req.uploadData = uploadedPhotos

    next();
})

const getAllPhotos = asyncHandler(async (req, res) => {
    /*
        -First get NoteId from frontend
        -check it is not null
        -find note in database if not than throw error
        -find all photos of that noteId in database
        -check if not found than send message photos not found
        -if found than send it to frontend
    */

    const { typeId } = req.params

    if (!typeId) {
        throw new ApiError(400, "Note ID is required")
    }

    const note = await Note.findById(typeId)

    if (!note) {
        throw new ApiError(400, "Notes not found")
    }

    const photos = await Photo.find({ typeId: typeId, type: "Note" })

    if (!photos) {
        res.status(200).json(new ApiResponse(404, [], "Photos not found"))
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, photos, "Get photos successfully")
        )
})

const deleteNote = asyncHandler(async (req, res) => {
    const { notesId } = req.body

    if (!notesId) {
        throw new ApiError(400, "Notes ID is required!")
    }

    const photos = await Photo.find({ typeId: notesId, type: "Note" })
    if (photos.length > 0) {
        await Promise.all(
            photos.map(async (photo) => {
                if (photo.public_id) {
                    try {
                        await deleteItemOnCloudinary(photo.public_id)
                    } catch (error) {
                        console.error("Failed to delete photo on cloudinary!! Err:", error)
                    }
                }
            })
        )

        const notePhotos = await Photo.deleteMany({ typeId: notesId, type: "Note" })
        if (notePhotos.deletedCount === 0) {
            throw new ApiError(500, "Failed to delete note photos!!")
        }
    }


    const result = await Note.deleteOne({ _id: notesId })
    if (result.deletedCount === 0) {
        throw new ApiError(500, "Note not found!!")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, result, "Successfully delete note!")
        )
})

export {
    addNotes,
    uploadNotes,
    getAllNotes,
    getAllPhotos,
    deleteNote
}