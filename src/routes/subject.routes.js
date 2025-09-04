import { Router } from "express";
import { addSubject, getAllSubjects } from "../controller/subject.controller.js";

const router = Router()

router.route("/add").post(addSubject)
router.route("/getAll").get(getAllSubjects)

export default router