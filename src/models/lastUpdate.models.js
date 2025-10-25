import mongoose from "mongoose";

const lastUpdateSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: () => {
            const d = new Date()
            d.setHours(0,0,0,0)
            return d;
        },
        unique: true
    },
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }
    ],
    notes: [
        {
            typeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note'},
            title: { type: String, required: true },
            photos: [{ type: String, required: true }]
        }
    ],
    assignments: [
        {
            typeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
            title: { type: String, required: true },
            photos: [{ type: String, required: true }]
        }
    ],
    labmanual: [
        {
            typeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabManual' },
            title: { type: String, required: true },
            photos: [{ type: String, required: true }]
        }
    ]
}, { timestamps: true })

export const LastUpdate = mongoose.model('LastUpdate', lastUpdateSchema)