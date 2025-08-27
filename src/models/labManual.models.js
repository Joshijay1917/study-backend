import mongoose from "mongoose";

const labSchema = new mongoose.Schema({
    name: {
        type: String
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
    }
}, { timestamps: true })

export const LabManual = mongoose.model("LabManual", labSchema)