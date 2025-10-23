import { Router } from "express";
import { currentUser, loginUser, refreshToken, registerUser } from "../controller/user.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/refresh-token").get(refreshToken)

router.route("/curr-user").get(verifyJwt, currentUser)

export default router