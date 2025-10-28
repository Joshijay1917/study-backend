import { Router } from "express";
import { addSubject, getAllSubjects, deleteSubject } from "../controller/subject.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/add").post(addSubject)
router.route("/delete").delete(deleteSubject)
router.route("/getAll").get(verifyJwt, getAllSubjects)

export default router