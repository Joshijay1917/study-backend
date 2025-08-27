import { Router } from "express";
import { addAssignment, uploadAssignment } from "../controller/assignment.controller.js"

const router = Router()

router.route("/add").post(addAssignment)
router.route("/upload").post(upload.single('photo'), uploadAssignment)

export default router