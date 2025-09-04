import { Router } from "express";

const router = Router()

router.route("/1").get(async(req, res)=>{
    res.send("Hello");
})

export default router