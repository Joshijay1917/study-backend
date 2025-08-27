import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true
    },
    sem: {
        type: Number,
        default: 0,
        index: true
    },
    branch: {
        type: String,
        enum: ["CE", "IT", "EC", "MECH", "CIVIL", "POLY"],
        required: true
    }
}, { timestamps: true })

export const Subject = mongoose.model("Subject", subjectSchema)