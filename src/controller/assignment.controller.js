import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { Assignment } from "../models/assignment.models.js"
import { Photo } from "../models/photo.models.js";
import { deleteItemOnCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js'
import { LastUpdate } from "../models/lastUpdate.models.js";


const getAllAssignment = asyncHandler(async (req, res) => {
    const { subjectId } = req.params

    if (!subjectId) {
        throw new ApiError(400, "Subject ID is required")
    }

    const assignments = await Assignment.find({ subject: subjectId })

    if (!assignments) {
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

    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "File not found")
    }

    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
        throw new ApiError(400, "Assignment not found")
    }
    
    const uploadPromises = req.files.map(async (file, index) => {
        const localPath = file.path
        if (!localPath) {
            throw new ApiError(500, "File localpath not found")
        }
        
        const photo = await uploadOnCloudinary(localPath);
        if (!photo) {
            throw new ApiError(500, "Cannot upload file")
        }
        
        return {photo, index};
    })
    
    const results = await Promise.all(uploadPromises)

    results.sort((a, b) => a.index - b.index);

    const uploadedPhotos = []
    
    for (const r of results) {
        if(!r || !r.photo) continue;

        const photo = r.photo

        const saveRes = await Photo.create({
            name: photo.display_name,
            subject: assignment.subject,
            width: photo.width,
            height: photo.height,
            url: photo.url,
            public_id: photo.public_id,
            type: "Assignment",
            typeId: assignment._id
        })
        
        if (!saveRes) {
            throw new ApiError(500, "Failed to save in database")
        }

        uploadedPhotos.push(saveRes)
    }

    if (uploadedPhotos.length === 0) {
        throw new ApiError(500, "No Photos were uploaded successfully!!");
    }

    req.uploadData = uploadedPhotos

    next();
})

const getAllPhotos = asyncHandler(async (req, res) => {
    const { typeId } = req.params

    if (!typeId) {
        throw new ApiError(400, "Assignment ID is required")
    }

    const assignment = await Assignment.findById(typeId)

    if (!assignment) {
        throw new ApiError(400, "Assignment not found")
    }

    const photos = await Photo.find({ typeId: typeId, type: "Assignment" })

    if (!photos) {
        res.status(404).json(new ApiResponse(404, [], "Photos not found"))
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, photos, "Get photos successfully")
        )
})

const deleteAssignment = asyncHandler(async (req, res) => {
    const { assignmentId } = req.body

    if (!assignmentId) {
        throw new ApiError(400, "Assignment ID is required!")
    }

    const photos = await Photo.find({ typeId: assignmentId, type: "Assignment" })
    if (photos.length > 0) {
        const results = await Promise.all(
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

        const assignmentPhotos = await Photo.deleteMany({ typeId: assignmentId, type: "Assignment" })
        if (assignmentPhotos.deletedCount === 0) {
            throw new ApiError(500, "Failed to delete photos in database!!")
        }
        
        const updateResult = await LastUpdate.updateMany(
            {},
            {
                $pull: {
                    assignments: {typeId: assignmentId}
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            console.warn("Assignment - No matching LastUpdate entries found — maybe already cleaned up.");
        }
    }


    const result = await Assignment.deleteOne({ _id: assignmentId })
    if (result.deletedCount === 0) {
        throw new ApiError(500, "Assignment not found!!")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, result, "Successfully delete assignment!")
        )
})

const deleteOne = asyncHandler(async (req, res) => {
    const { publicId } = req.body

    if (!publicId) {
        throw new ApiError(400, "Public Id is required!!")
    }

    const photo = await Photo.findOne({ public_id: publicId })
    if (!photo) {
        throw new ApiError(404, "Failed to find photo in database!")
    }

    try {
        await deleteItemOnCloudinary(publicId)
    } catch (error) {
        throw new ApiError(500, `Failed to delete item on cloudinary!!! Err:${error.message}`)
    }

    const result = await Photo.deleteOne({ public_id: publicId })
    if (result.deletedCount === 0) {
        throw new ApiError(404, "Photo not found in database!")
    }

    const updateResult = await LastUpdate.updateMany(
        {
            $or: [
                { "notes.photos": photo.url },
                { "assignments.photos": photo.url },
                { "labmanual.photos": photo.url },
            ]
        },
        {
            $pull: {
                "notes.$[].photos": photo.url,
                "assignments.$[].photos": photo.url,
                "labmanual.$[].photos": photo.url,
            }
        }
    )

    if (updateResult.modifiedCount === 0) {
        console.log("No matching LastUpdate entries found — maybe already cleaned up.");
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, result, "Successfully delete photo!!")
        )
})

export {
    addAssignment,
    uploadAssignment,
    getAllAssignment,
    getAllPhotos,
    deleteAssignment,
    deleteOne
}