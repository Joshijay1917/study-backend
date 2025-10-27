import { Router } from "express";
import { addLabManual, uploadLab, getAllLabmanuals, getAllPhotos } from "../controller/labManual.controller.js"
import { upload } from '../middleware/multer.middleware.js'
import { verifyJwt } from "../middleware/auth.middleware.js";
import { updateTracker } from "../middleware/update.middleware.js";

const router = Router()

router.route("/:subjectId").get(verifyJwt, getAllLabmanuals)
router.route("/add").post(addLabManual)
router.route("/upload").post(upload.single('photo'), uploadLab, updateTracker)
router.route("/photos").post(verifyJwt, getAllPhotos)

export default router