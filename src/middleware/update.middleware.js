import { ApiError } from "../utils/apiError.js"
import { LastUpdate } from "../models/lastUpdate.models.js"
import { Note } from "../models/notes.models.js"
import { Assignment } from "../models/assignment.models.js"
import { LabManual } from "../models/labManual.models.js"
import { ApiResponse } from "../utils/apiResponse.js"

export const updateTracker = async (req, res, next) => {
    try {
        const uploads = req.uploadData
        console.log("Uploadphotos=", req.uploadData);
        

        if (!uploads || uploads.length === 0) {
            throw new ApiError(400, "No uploaded data found in updateTracker");
        }

        const { type, typeId, subject } = uploads[0]
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
        
        if (!record) {
            console.log("Create Update Document!!");
            record = await LastUpdate.create({ date, subjects: [] })
        }

        if (subject && !record.subjects.includes(subject)) {
            record.subjects.push(subject);
        }

        let targetArray;
        if (type === "Note") targetArray = record.notes;
        else if (type === "Assignment") targetArray = record.assignments;
        else targetArray = record.labmanual;

        let item = targetArray.find(r => r.typeId.toString() === typeId.toString());
        if (!item) {
            targetArray.push({ typeId, title, photos: uploads.map(u => u.url) });
        } else {
            // item.photos.push(req.uploadData._doc.url);
            uploads.forEach(u => item.photos.push(u.url));
        }

        await record.save();

        res
        .status(201)
        .json(
            new ApiResponse(201, uploads, "Successfully saved in database and update tracker")
        )
    } catch (error) {
        console.error("UpdateTracker middleware error " + error)
        throw new ApiError(500, "UpdateTracker middleware error " + error)
    }
}