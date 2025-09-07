import { Router } from "express";
import { addNotes, uploadNotes, getAllNotes } from "../controller/notes.controller.js"
import { upload } from '../middleware/multer.middleware.js'

const router = Router()

router.route("/getAll").post(getAllNotes)
router.route("/add").post(addNotes)
router.route("/upload").post(upload.single('photo'), uploadNotes)

export default router