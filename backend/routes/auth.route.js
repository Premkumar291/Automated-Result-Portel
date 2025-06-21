import express, { Router } from 'express';
import { login, logout, signup, verifyEmail } from '../controller/auth.controller.js';

const router = express.Router();

router.post("/signup",signup);

router.post("/login" , login);

router.post("/logout" , logout);

router.post("/verify-email", verifyEmail)

export default router;