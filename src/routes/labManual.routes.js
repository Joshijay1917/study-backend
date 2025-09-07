import { Router } from "express";
import { addLabManual, uploadLab, getAllLabmanuals } from "../controller/labManual.controller.js"
import { upload } from '../middleware/multer.middleware.js'

const router = Router()

router.route("/getAll").post(getAllLabmanuals)
router.route("/add").post(addLabManual)
router.route("/upload").post(upload.single('photo'), uploadLab)

export default router