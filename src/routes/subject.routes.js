import { Router } from "express";
import { addSubject } from "../controller/subject.controller.js";

const router = Router()

router.route("/add").post(addSubject)

export default router