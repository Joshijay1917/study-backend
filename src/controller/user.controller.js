import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refresh_token = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Error while generating access and refresh Tokens!")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    /*
        -Get all fields from body
        -check if any required field missing than throw error
        -check email and phone number
        -check if user already exists
        -save user in database
        -send response

        "username": "jay",
        "password": "Jay191",
        "phone": "9106052826",
        "email": "Jay@gmail.com",
        "sem": 2,
        "branch": "CE",
        "year": 2
    */

    const { username, password, phone, email, sem, branch, year } = req.body

    if (
        [username, password, phone, email].forEach(f => f.value == '') ||
        [sem, branch, year].forEach(f => f.value == 0)
    ) {
        throw new ApiError(400, "Cannot get required fields!");
    }

    if (!email.includes('@') || !email.includes('.')) {
        throw new ApiError(400, "Please Enter Valid Email");
    }

    if (phone.length !== 10) {
        throw new ApiError(400, "Please Enter Mobile no.");
    }

    const existUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existUser) {
        throw new ApiError("User already registered!!")
    }

    const user = await User.create({
        username,
        email,
        password,
        phone,
        sem,
        branch,
        year
    })

    if (!user) {
        throw new ApiError(500, "Failed to register user!!")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, user, "User registered successfully!!")
        )
})

const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    if (!username && !password) {
        throw new ApiError(400, "Username and password is required")
    }

    const user = await User.findOne({ username })

    if (!user) {
        throw new ApiError(400, "User does not exists")
    }

    const isPasswordValid = await user.comaprePassword(password)

    if (!isPasswordValid) {
        throw new ApiError(400, "Password is not valid");
    }

    const { accessToken, refreshToken } = await generateAccessRefreshTokens(user._id)

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }

    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user, accessToken, refreshToken }, "User LoggedIn Successfully")
        )
})

const currentUser = asyncHandler(async (req, res) => {
    res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "User get successfully")
        )
})

const refreshToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken

    console.log("Cookies=", req.cookies);


    if (!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorized request!!!")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== user.refresh_token) {
            throw new ApiError(401, "RefreshToken is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }

        const { refreshToken, accessToken } = await generateAccessRefreshTokens(decodedToken._id);

        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { user, accessToken, refreshToken }, "Tokens refreshed successfully")
            )
    } catch (error) {
        throw new ApiError(400, "Token is Invalid " + error)
    }
})

const logoutUser = asyncHandler(async (req, res) => {
    const user = req.user;

    const existUser = await User.findById(user._id)
    if(!existUser) {
        throw new ApiError(400, "User does not exists!")
    }

    existUser.refresh_token = null;
    await existUser.save();

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }

    res.clearCookie('accessToken', options);
    res.clearCookie('refreshToken', options);

    return res.status(200).json(
        new ApiResponse(200, {}, "Logged out successfully")
    );
})

export {
    registerUser,
    loginUser,
    currentUser,
    refreshToken,
    logoutUser
}