import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// Admin Routes
router.get("/admin/dashboard", verifyToken, authorize('admin'), (req, res) => {
    res.json({ success: true, message: "Admin dashboard access granted" });
});

router.get("/admin/users", verifyToken, authorize('admin'), (req, res) => {
    res.json({ success: true, message: "Admin users access granted" });
});

// Faculty Routes
router.get("/faculty/dashboard", verifyToken, authorize('faculty'), (req, res) => {
    res.json({ success: true, message: "Faculty dashboard access granted" });
});

router.get("/faculty/results", verifyToken, authorize('faculty'), (req, res) => {
    res.json({ success: true, message: "Faculty results access granted" });
});

// Protected Routes that both roles can access
router.get("/profile", verifyToken, authorize('admin', 'faculty'), (req, res) => {
    res.json({ success: true, message: "Profile access granted" });
});

export default router;
