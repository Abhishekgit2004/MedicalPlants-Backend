import { Router } from "express";
import {loginUser, logoutUser, Register} from "../controller/Rgister.js";

const router=Router()

router.route("/register").post(Register)
router.route("/login").post(loginUser)
router.route("/logout").post(logoutUser)

export default router