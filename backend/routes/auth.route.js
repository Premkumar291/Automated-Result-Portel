import express from "express";
import {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  verifyResetToken,
  resetPassword
} from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-token", verifyResetToken);
router.post("/reset-password", resetPassword);

export default router;