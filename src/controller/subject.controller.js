import { Assignment } from "../models/assignment.models.js";
import { LabManual } from "../models/labManual.models.js";
import { LastUpdate } from "../models/lastUpdate.models.js";
import { Note } from "../models/notes.models.js";
import { Subject } from "../models/subject.models.js";
import { deleteService } from "../services/deleteService.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllSubjects = asyncHandler(async (req, res) => {

    const subjects = await Subject.find();

    if (!subjects) {
        throw new ApiError(500, "Failed to get all subjects")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, subjects, "Get all subjects successfully")
        )
})

const addSubject = asyncHandler(async (req, res) => {
    const { name, sem, branch } = req.body

    if (!name || !sem || !branch) {
        throw new ApiError(400, "Required fields are missing")
    }

    const exists = await Subject.findOne({ name })

    if (exists) {
        throw new ApiError(400, "Subject already exists")
    }

    const subject = await Subject.create({
        name,
        sem,
        branch
    })

    if (!subject) {
        throw new ApiError(500, "Failed to save in database!")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, subject, "Successfully saved in database")
        )
})

const deleteSubject = asyncHandler(async (req, res) => {
    const { subjectId } = req.body

    if (!subjectId) {
        throw new ApiError(400, "Subject ID is required!")
    }

    const notes = await Note.find({ subject: subjectId })
    const assignments = await Assignment.find({ subject: subjectId })
    const labmanual = await LabManual.find({ subject: subjectId })

    if (notes.length > 0) {
        await Promise.all(
            notes.map(async (note) => {
                try {
                    await deleteService(note._id, "Note")
                } catch (error) {
                    console.error("DeleteService Error - ", error)
                    throw new ApiError(500, "DeleteService failed!!")
                }
            })
        )

        const noteDeleteResult = await Note.deleteMany({ subject: subjectId })
        if(noteDeleteResult.deletedCount === 0) {
            console.warn("No notes deleted for this subject");
        }
    }
    if(assignments.length > 0) {
        await Promise.all(
            assignments.map(async (ass) => {
                try {
                    await deleteService(ass._id, "Assignment")
                } catch (error) {
                    console.error("DeleteService Error - ", error)
                    throw new ApiError(500, "DeleteService failed!!")
                }
            })
        )

        const assDeleteResult = await Assignment.deleteMany({ subject: subjectId })
        if(assDeleteResult.deletedCount === 0) {
            console.warn("No assignments deleted for this subject");
        }
    }
    if(labmanual.length > 0) {
        await Promise.all(
            labmanual.map(async (lab) => {
                try {
                    await deleteService(lab._id, "LabManual")
                } catch (error) {
                    console.error("DeleteService Error - ", error)
                    throw new ApiError(500, "DeleteService failed!!")
                }
            })
        )

        const labDeleteResult = await LabManual.deleteMany({ subject: subjectId })
        if(labDeleteResult.deletedCount === 0) {
            console.warn("No lab manuals deleted for this subject");
        }
    }

    const result = await Subject.deleteOne({ _id: subjectId })

    if (result.deletedCount === 0) {
        throw new ApiError(500, "Subject not found!!")
    }

    await LastUpdate.updateMany(
        { subjects: subjectId },
        { $pull: { subjects: subjectId } }
    );

    res
        .status(200)
        .json(
            new ApiResponse(200, result, "Successfully delete Subject!")
        )
})

export {
    addSubject,
    getAllSubjects,
    deleteSubject
}