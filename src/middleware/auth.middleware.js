import { User } from "../models/user.models.js"
import { ApiError } from "../utils/apiError.js"
import jwt from "jsonwebtoken"

export const verifyJwt = async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token) {
            throw new ApiError(400, "Unauthorized request!!")
        }
    
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        } catch (error) {
            if(error.name = 'TokenExpiredError') {
                throw new ApiError(401, "Token expired")
            }
            throw new ApiError(401, "Invalid Access Token")
        }
    
        const user = await User.findById(decodedToken._id).select('-password -refresh_token')
    
        if(!user) {
            throw new ApiError(400, "Invalid Access Token!!")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, "Invalid Access Token middleware error " + error)
    }
}