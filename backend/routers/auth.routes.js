import express from "express";
import { signup, login, logout, refresh_token } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refresh_token);


export default router;