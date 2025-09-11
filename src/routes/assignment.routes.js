import { Router } from "express";
import { addAssignment, uploadAssignment, getAllAssignment, getAllPhotos } from "../controller/assignment.controller.js"
import { upload } from '../middleware/multer.middleware.js'

const router = Router()

router.route("/getAll").post(getAllAssignment)
router.route("/add").post(addAssignment)
router.route("/upload").post(upload.single('photo'), uploadAssignment)
router.route("/photos").post(getAllPhotos)

export default router