import bcrypt from "bcryptjs";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendEmail } from "../utils/sendEmail.js";
import { User } from '../models/user.model.js';

export const signup = async (req, res) => {
    const { email, password, name, department } = req.body;
    try {
        console.log('Signup request received:', { email, name, department });

        if (!email || !password || !name || !department) {
            console.log('Missing required fields');
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ 
                success: false, 
                message: "User already exists" 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationCode();

        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            department,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        
        await newUser.save();
        console.log('User created successfully:', newUser._id);

        // Send verification email
        try {
            await sendEmail(
                newUser.email,
                "Verify your account",
                `Your verification code is: ${newUser.verificationToken}`
            );
            console.log('Verification email sent to:', newUser.email);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Continue anyway, user can request resend
        }

        

        // JWT authentication
        try {
            generateTokenAndSetCookie(newUser._id, res);
        } catch (jwtError) {
            console.error('JWT token generation failed:', jwtError);
            return res.status(500).json({
                success: false,
                message: "Account created but login failed. Please try logging in manually."
            });
        }

        res.status(201).json({
            success: true,
            message: "User created successfully. Verification email sent.",
            user: {
                _id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                department: newUser.department,
                isVerified: newUser.isVerified
            }
        });

    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const verifyEmail = async (req, res) => {
    const {code} = req.body;
    try {
        console.log('Email verification request:', { code });

        if (!code) {
            return res.status(400).json({ 
                success: false, 
                message: "Verification code is required" 
            });
        }

        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            console.log('Invalid or expired verification code:', code);
            return res.status(400).json({ 
                success: false, 
                message: "Invalid or expired verification code" 
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();

        try {
            await sendEmail(
                user.email,
                "Email Verified",
                "Your email has been successfully verified."
            );
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
        }

        console.log('Email verified successfully for user:', user.email);

        res.status(200).json({ 
            success: true, 
            message: "Email verified successfully" 
        });

    } catch (error) {
        console.error("Error during email verification:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export const login = async (req,res) => {
    const { email, password } = req.body;
    try {
        console.log('Login request received:', { email });

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required" 
            });
        }

        const user = await User.findOne({email}).maxTimeMS(5000);
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Invalid password for user:', email);
            return res.status(400).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(400).json({ 
                success: false, 
                message: "Please verify your email before logging in",
                needsVerification: true
            });
        }

        try {
            generateTokenAndSetCookie(user._id, res);
        } catch (jwtError) {
            console.error('JWT token generation failed:', jwtError);
            return res.status(500).json({
                success: false,
                message: "Login failed. Please try again."
            });
        }

        user.lastLogin = Date.now();
        await user.save({ maxTimeMS: 5000 });

        console.log('Login successful for user:', email);

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                department: user.department,
                isVerified: user.isVerified
            }
        });
        
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const logout = async (req,res) => {
    try {
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        res.status(200).json({ 
            success: true, 
            message: "Logged out successfully" 
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Send reset token to user's email
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        console.log('Forgot password request:', { email });

        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: "Email is required" 
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for password reset:', email);
            return res.status(400).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        const resetToken = generateVerificationCode();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes
        await user.save();

        try {
            await sendEmail(
                user.email,
                "Reset Password",
                `Your reset password code is: ${resetToken}. It is valid for 30 minutes.`
            );
            console.log('Password reset email sent to:', user.email);
        } catch (emailError) {
            console.error('Failed to send reset email:', emailError);
            return res.status(500).json({ 
                success: false, 
                message: "Failed to send reset email" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Reset password code sent to your email." 
        });
    } catch (error) {
        console.error("Error during forgot password:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Verify reset token
export const verifyResetToken = async (req, res) => {
    const { email, code } = req.body;
    try {
        console.log('Verify reset token request:', { email, code });

        if (!email || !code) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and code are required" 
            });
        }

        const user = await User.findOne({
            email,
            resetPasswordToken: code,
            resetPasswordExpiresAt: { $gt: Date.now() }
        });
        if (!user) {
            console.log('Invalid or expired reset code:', { email, code });
            return res.status(400).json({ 
                success: false, 
                message: "Invalid or expired reset code" 
            });
        }
        res.status(200).json({ 
            success: true, 
            message: "Reset code is valid" 
        });
    } catch (error) {
        console.error("Error during reset token verification:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
        console.log('Reset password request:', { email, code });

        if (!email || !code || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "Email, code, and new password are required" 
            });
        }

        const user = await User.findOne({
            email,
            resetPasswordToken: code,
            resetPasswordExpiresAt: { $gt: Date.now() }
        });
        if (!user) {
            console.log('Invalid or expired reset code for password reset:', { email, code });
            return res.status(400).json({ 
                success: false, 
                message: "Invalid or expired reset code" 
            });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        console.log('Password reset successful for user:', email);

        res.status(200).json({ 
            success: true, 
            message: "Password reset successful" 
        });
    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }

};

export const checkAuth = async (req, res) => {
    try {
        console.log('checkAuth called, req.userId:', req.userId);
        console.log('checkAuth called, req.user:', req.user);
        
        // Use userId from either req.userId or req.user.userId
        const userId = req.userId || (req.user && req.user.userId);
        
        if (!userId) {
            console.error('No userId found in request');
            return res.status(401).json({ 
                success: false, 
                message: "Authentication required - no userId" 
            });
        }

        console.log('Finding user by ID:', userId);
        
        // Add timeout to the database query
        const user = await User.findById(userId).maxTimeMS(5000);
        
        if (!user) {
            console.log('User not found for ID:', userId);
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        console.log('User found successfully:', user.email);

        res.status(200).json({
            success: true,
            message: "User authenticated successfully",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                department: user.department,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error("Error during auth check:", error);
        
        // Specific handling for timeout errors
        if (error.name === 'MongooseError' && error.message.includes('timeout')) {
            return res.status(503).json({ 
                success: false, 
                message: "Database connection timeout. Please try again." 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
        
    }
}