import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendEmail } from "../utils/sendEmail.js";
import { User } from '../models/user.model.js';

export const signup = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        if (!email || !password || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userAlreadyExists = await User.findOne({ email });

        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationCode();

        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        
        await newUser.save();

        // Send verification email
        await sendEmail(
            newUser.email,
            "Verify your account",
            `Your verification code is: ${newUser.verificationToken}`
        );

        

        // JWT authentication
        generateTokenAndSetCookie(newUser._id, res);

        res.status(201).json({
            success: true,
            message: "User created successfully. Verification email sent.",
            user: {
                _id: newUser._id,
                email: newUser.email,
                name: newUser.name
            }
        });

    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyEmail = async (req, res) => {
    const {code} = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();

        await sendEmail(
            user.email,
            "Email Verified",
            "Your email has been successfully verified."
        );

        res.status(200).json({ message: "Email verified successfully" });

    } catch (error) {
        res.status(500).json({ message: `Error : Message ${error.message}` });
    }
}

export const login = async (req,res) => {
    const { email, password } = req.body;
    try {

        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        generateTokenAndSetCookie(user._id, res);

        user.lastLogin = Date.now();
        await user.save();

        res.status(200).json({
            message: "Login successful",
        });
        
    } catch (error) {
        res.status(500).json({ message: `Error : Message ${error.message}` });
    }
};

export const logout = async (req,res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
};

// Send reset token to user's email
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const resetToken = generateVerificationCode();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
        await user.save();

        await sendEmail(
            user.email,
            "Reset Password",
            `Your reset password code is: ${resetToken}. It is valid for 30 minutes.`
        );

        res.status(200).json({ message: "Reset password code sent to your email." });
    } catch (error) {
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Verify reset token
export const verifyResetToken = async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await User.findOne({
            email,
            resetPasswordToken: code,
            resetPasswordExpiresAt: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }
        res.status(200).json({ message: "Reset code is valid" });
    } catch (error) {
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
        const user = await User.findOne({
            email,
            resetPasswordToken: code,
            resetPasswordExpiresAt: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: `Error: ${error.message}` });
    }

};