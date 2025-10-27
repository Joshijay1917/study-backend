import { Router } from "express";
import { addNotes, uploadNotes, getAllNotes, getAllPhotos } from "../controller/notes.controller.js"
import { upload } from '../middleware/multer.middleware.js'
import { verifyJwt } from "../middleware/auth.middleware.js";
import { updateTracker } from "../middleware/update.middleware.js";
import { generatePdf } from "../utils/generatePdf.js";

const router = Router()

router.route("/:subjectId").get(verifyJwt, getAllNotes)
router.route("/add").post(addNotes)
router.route("/upload").post(upload.single('photo'), uploadNotes, updateTracker)
router.route("/photos/:typeId").get(getAllPhotos)
router.route("/pdf").post(verifyJwt, generatePdf)

export default router