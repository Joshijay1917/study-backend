import { Router } from "express";
import { addAssignment, uploadAssignment, getAllAssignment, getAllPhotos } from "../controller/assignment.controller.js"
import { upload } from '../middleware/multer.middleware.js'
import { verifyJwt } from "../middleware/auth.middleware.js";
import { updateTracker } from "../middleware/update.middleware.js";

const router = Router()

router.route("/getAll").post(verifyJwt, getAllAssignment)
router.route("/add").post(addAssignment)
router.route("/upload").post(upload.single('photo'), uploadAssignment, updateTracker)
router.route("/photos").post(verifyJwt, getAllPhotos)

export default router