import { Router } from "express";
import { addLabManual, uploadLab, getAllLabmanuals, getAllPhotos, deleteLabmanual } from "../controller/labManual.controller.js"
import { upload } from '../middleware/multer.middleware.js'
import { verifyJwt } from "../middleware/auth.middleware.js";
import { updateTracker } from "../middleware/update.middleware.js";

const router = Router()

router.route("/:subjectId").get(verifyJwt, getAllLabmanuals)
router.route("/add").post(addLabManual)
router.route("/delete").delete(deleteLabmanual)
router.route("/upload").post(upload.array('photos'), uploadLab, updateTracker)
router.route("/photos/:typeId").get(verifyJwt, getAllPhotos)

export default router