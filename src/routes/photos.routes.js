import { Router } from "express";
import { uploadPhotos } from "../controller/photo.controller.js";
import { upload } from '../middleware/multer.middleware.js'

const router = Router()

router.route("/upload").post(upload.single('photo'), uploadPhotos)

export default router