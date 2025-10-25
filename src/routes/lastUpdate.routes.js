import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { getLatestUpdates } from "../controller/lastUpdate.controller.js";

const router = Router()

router.route("/").get(verifyJwt ,getLatestUpdates)

export default router