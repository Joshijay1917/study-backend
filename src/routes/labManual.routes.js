import { Router } from "express";
import { addLabManual, uploadLab } from "../controller/labManual.controller.js"

const router = Router()

router.route("/add").post(addLabManual)
router.route("/upload").post(upload.single('photo'), uploadLab)

export default router