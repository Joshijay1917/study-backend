import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    sem: {
        type: Number,
        default: 0
    },
    branch: {
        type: String,
        enum: ["CE", "IT", "EC", "MECH", "CIVIL", "POLY"],
        required: true
    },
    year: {
        type: String,
        required: true
    },
    refresh_token: {
        type: String,
        required: true
    }
}, { timestamps: true })

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comaprePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function() {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            sem: this.sem,
            branch: this.branch,
            year: this.year
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.Schema("User", userSchema)