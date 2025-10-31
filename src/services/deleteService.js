import { LastUpdate } from "../models/lastUpdate.models.js";
import { Photo } from "../models/photo.models.js"
import { deleteItemOnCloudinary } from "../utils/cloudinary.js"
import { ApiError } from "../utils/apiError.js";

export const deleteService = async (typeId, type) => {
    if(!type || !typeId) {
        throw new ApiError(400, "DeleteService - Type and typeId is required!!")
    }

    const photos = await Photo.find({ typeId, type })

    const typeMap = {
        Note: "notes",
        Assignment: "assignments",
        LabManual: "labmanual"
    }

    const lastUpdateField = typeMap[type];
    if (!lastUpdateField) {
        throw new ApiError(400, `DeleteService -  Invalid type: ${type}`);
    }

    if (photos.length > 0) {
        await Promise.all(
            photos.map(async (photo) => {
                if (photo.public_id) {
                    try {
                        await deleteItemOnCloudinary(photo.public_id)
                    } catch (error) {
                        console.error(`Failed to delete photo on cloudinary!! Err:${error.message}`)
                    }
                }
            })
        );

        const result = await Photo.deleteMany({ typeId })
        if (result.deletedCount === 0) {
            throw new ApiError(500, "Failed to delete photos in database!!")
        }

        const updateResult = await LastUpdate.updateMany({ [`${type.toLowerCase()}.typeId`]: typeId },
            { 
                $pull: { 
                    [type.toLowerCase()]: { typeId }
                } 
            }
        )

        if(updateResult.modifiedCount === 0) {
            console.warn("Notes - No matching LastUpdate entries found — maybe already cleaned up.");
        }
    }
}