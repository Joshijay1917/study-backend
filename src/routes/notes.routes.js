import { Router } from "express";
import { addNotes, uploadNotes } from "../controller/notes.controller.js"

const router = Router()

router.route("/add").post(addNotes)
router.route("/upload").post(upload.single('photo'), uploadNotes)

export default router