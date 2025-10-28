import { ApiError } from "../utils/apiError.js"
import { LastUpdate } from "../models/lastUpdate.models.js"
import { Note } from "../models/notes.models.js"
import { Assignment } from "../models/assignment.models.js"
import { LabManual } from "../models/labManual.models.js"

export const updateTracker = async (req, res, next) => {
    try {
        const { type, typeId, subject } = req.uploadData

        if (!type || !typeId || !subject) {
            throw new ApiError(400, "Update Tracker middleware error required fields not found");
        }

        let typeDetails, title;
        switch (type) {
            case "Note":
                typeDetails = await Note.findById(typeId)
                title = "Unit " + typeDetails.unit + ": " + typeDetails.name
                break;
            case "Assignment":
                typeDetails = await Assignment.findById(typeId)
                title = "Assignment " + typeDetails.number
                break;
            case "LabManual":
                typeDetails = await LabManual.findById(typeId)
                title = "LabManual " + typeDetails.name
                break;
            default:
                typeDetails = null
                title = null
                break;
        }

        if (!typeDetails || !title) {
            throw new ApiError(400, "Update Middleware: Cannot find required Details!!")
        }

        const date = new Date();
        date.setHours(0, 0, 0, 0)


        let record = await LastUpdate.findOne({ date })
        console.log("record=", record);

        if (!record) {
            console.log("Create Update Document!!");
            record = await LastUpdate.create()
        }

        if (subject && !record.subjects.includes(subject)) {
            record.subjects.push(subject);
        }

        let targetArray;
        if (type === "Note") targetArray = record.notes;
        else if (type === "Assignment") targetArray = record.assignments;
        else targetArray = record.labmanual;

        let item = targetArray.find(r => r.typeId === typeId);
        if (!item) {
            targetArray.push({ typeId, title, photos: [res.locals.url] });
        } else {
            item.photos.push(res.locals.url);
        }

        console.log("CurrentSubjects=", record.subjects);

        await record.save();

        res
        .status(201)
        .json(
            new ApiResponse(201, req.uploadData, "Successfully saved in database and update tracker")
        )
    } catch (error) {
        console.error("UpdateTracker middleware error " + error)
        throw new ApiError(500, "UpdateTracker middleware error " + error)
    }
}