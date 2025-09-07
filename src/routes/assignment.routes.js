import { Router } from "express";
import { addAssignment, uploadAssignment, getAllAssignment } from "../controller/assignment.controller.js"
import { upload } from '../middleware/multer.middleware.js'

const router = Router()

router.route("/getAll").post(getAllAssignment)
router.route("/add").post(addAssignment)
router.route("/upload").post(upload.single('photo'), uploadAssignment)

export default router