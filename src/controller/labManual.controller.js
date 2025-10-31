import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { LabManual } from "../models/labManual.models.js"
import { Photo } from "../models/photo.models.js";
import { deleteItemOnCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js'
import { LastUpdate } from "../models/lastUpdate.models.js";
import { deleteService } from "../services/deleteService.js";

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

    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "File not found")
    }

    const labmanual = await LabManual.findById(labmanualId)
    if (!labmanual) {
        throw new ApiError("Sorry cannot find labmanual!!")
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
        
        return { photo, index };
    })
    
    const results = await Promise.all(uploadPromises)
    
    results.sort((a, b) => a.index - b.index);

    const uploadedPhotos = []

    for (const r of results) {
        if (!r || !r.photo) continue;

        const photo = r.photo;

        const saveRes = await Photo.create({
            name: photo.display_name,
            subject: labmanual.subject,
            width: photo.width,
            height: photo.height,
            url: photo.url,
            public_id: photo.public_id,
            type: "LabManual",
            typeId: labmanual._id
        })
        
        if (!saveRes) {
            throw new ApiError(500, "Failed to save in database")
        }

        uploadedPhotos.push(saveRes);
    }

    if (uploadedPhotos.length === 0) {
        throw new ApiError(500, "No photos were uploaded successfully");
    }

    req.uploadData = uploadedPhotos

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

const deleteLabmanual = asyncHandler(async (req, res) => {
    const { labmanualId } = req.body

    if (!labmanualId) {
        throw new ApiError(400, "Lab Manual ID is required!")
    }

    try {
        await deleteService(labmanualId, "LabManual")
    } catch (error) {
        console.error("DeleteService Error - ", error)
        throw new ApiError(500, "DeleteService failed!!")
    }

    const result = await LabManual.deleteOne({ _id: labmanualId })

    if (result.deletedCount === 0) {
        throw new ApiError(500, "Lab Manual not found!!")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, result, "Successfully delete lab manual!")
        )
})

const deleteOne = (asyncHandler(async (req, res) => {
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
}))

export {
    addLabManual,
    uploadLab,
    getAllLabmanuals,
    getAllPhotos,
    deleteLabmanual,
    deleteOne
}