import { Router } from "express";
import { addAssignment, uploadAssignment, getAllAssignment, getAllPhotos, deleteAssignment } from "../controller/assignment.controller.js"
import { upload } from '../middleware/multer.middleware.js'
import { verifyJwt } from "../middleware/auth.middleware.js";
import { updateTracker } from "../middleware/update.middleware.js";

const router = Router()

router.route("/:subjectId").get(verifyJwt, getAllAssignment)
router.route("/add").post(addAssignment)
router.route("/delete").delete(deleteAssignment)
router.route("/upload").post(upload.array('photos'), uploadAssignment, updateTracker)
router.route("/photos/:typeId").get(verifyJwt, getAllPhotos)

export default router