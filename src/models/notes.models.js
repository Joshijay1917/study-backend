import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    name: {
        type: String
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
    },
    unit: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

export const Note = mongoose.model("Note", noteSchema)