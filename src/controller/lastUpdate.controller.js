import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { LastUpdate } from "../models/lastUpdate.models.js";

const getLatestUpdates = asyncHandler(async (req, res) => {
    
    const records = await LastUpdate.find({})
    .populate("subjects")
    .sort({ date: -1 })

    if(!records) {
        throw new ApiError(500, "Failed to get records")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, records, "Get All Records Successfully")
    )
})

export {
    getLatestUpdates
}