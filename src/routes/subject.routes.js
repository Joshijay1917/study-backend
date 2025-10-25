import { Router } from "express";
import { addSubject, getAllSubjects } from "../controller/subject.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/add").post(addSubject)
router.route("/getAll").get(verifyJwt, getAllSubjects)

export default router