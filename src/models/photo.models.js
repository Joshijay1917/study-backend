import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject"
    },
    width: {
        type: Number
    },
    height: {
        type: Number
    },
    url: {
        type: String, //cloudinary url
        required: true
    },
    public_id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["Note", "LabManual", "Assignment"],
        required: true
    },
    typeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {timestamps: true})

export const Photo = mongoose.model("Photo", photoSchema)