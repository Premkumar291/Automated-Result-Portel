import bcrypt from "bcryptjs";
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