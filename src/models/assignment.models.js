import mongoose from "mongoose";

const assSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        default: null
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
    }
}, { timestamps: true })

export const Assignment = mongoose.model("Assignment", assSchema)