import { Subject } from "../models/subject.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addSubject = asyncHandler(async (req, res) => {
    const { name, sem, branch } = req.body

    if(!name || !sem || !branch) {
        throw new ApiError(400, "Required fields are missing")
    }

    const exists = await Subject.findOne({ name })

    if(exists) {
        throw new ApiError(400, "Subject already exists")
    }

    const subject = await Subject.create({
        name,
        sem,
        branch
    })

    if(!subject) {
        throw new ApiError(500, "Failed to save in database!")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, subject, "Successfully saved in database")
    )
})

export {
    addSubject
}