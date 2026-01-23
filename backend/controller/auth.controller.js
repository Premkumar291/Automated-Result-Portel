import bcrypt from "bcryptjs";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendEmail } from "../utils/sendEmail.js";
import { User } from '../models/user.model.js';

export const signup = async (req, res) => {
    const { email, password, name, department, role, collegeName, adminSecret } = req.body;
    try {

        // Validate role if provided
        if (role && !['faculty', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Must be either 'faculty' or 'admin'"
            });
        }

        // Security check for admin creation
        if (role === 'admin' && process.env.NODE_ENV === 'production') {
            if (!process.env.ADMIN_SECRET || adminSecret !== process.env.ADMIN_SECRET) {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized to create admin account"
                });
            }
        }

        // For admin users, collegeName is required
        if (role === 'admin' && !collegeName) {
            return res.status(400).json({
                success: false,
                message: "College name is required for admin users"
            });
        }

        if (!email || !password || !name || !department) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
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
            collegeName: role === 'admin' ? collegeName : undefined, // Only set for admin users
            role: role || 'faculty', // Default to faculty if role not provided
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        });



        await newUser.save();

        // JWT authentication
        try {
            generateTokenAndSetCookie(newUser._id, newUser.role, res);
        } catch (jwtError) {
            return res.status(500).json({
                success: false,
                message: "Account created but login failed. Please try logging in manually."
            });
        }

        res.status(201).json({
            success: true,
            message: "User created successfully. Please login to verify your email.",
            user: {
                _id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                department: newUser.department,
                collegeName: newUser.collegeName, // Include collegeName in response
                role: newUser.role,
                isVerified: newUser.isVerified
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Verification code is required"
            });
        }

        // First, try to find user with valid (non-expired) token
        let user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            // Check if user exists with this code but token is expired
            const expiredUser = await User.findOne({
                verificationToken: code
            });

            if (expiredUser && !expiredUser.isVerified) {

                // Generate new verification code
                const newVerificationToken = generateVerificationCode();
                expiredUser.verificationToken = newVerificationToken;
                expiredUser.verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
                await expiredUser.save();

                // Send new verification email
                try {
                    await sendEmail(
                        expiredUser.email,
                        "New Verification Code",
                        `Your previous verification code expired. Your new verification code is: ${newVerificationToken}. It is valid for 10 minutes.`
                    );
                } catch (emailError) {
                    // Email sending failed - log internally if needed
                }

                return res.status(400).json({
                    success: false,
                    message: "Verification code expired. A new verification code has been sent to your email.",
                    codeExpired: true
                });
            }

            return res.status(400).json({
                success: false,
                message: "Invalid verification code"
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
            // Email sending failed - log internally if needed
        }


        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                department: user.department,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email }).maxTimeMS(5000);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check if user is verified - send verification email if needed
        if (!user.isVerified) {
            let shouldSendEmail = false;
            let verificationCode = user.verificationToken;

            // Only generate new code if expired or doesn't exist
            if (!user.verificationToken || !user.verificationTokenExpiresAt || user.verificationTokenExpiresAt < Date.now()) {
                const newVerificationToken = generateVerificationCode();
                user.verificationToken = newVerificationToken;
                user.verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
                await user.save();
                verificationCode = newVerificationToken;
                shouldSendEmail = true; // Only send email if code was regenerated
            }
            // If code is still valid, don't send another email

            // Send verification email only if new code was generated
            if (shouldSendEmail) {
                try {
                    await sendEmail(
                        user.email,
                        "Verify your account",
                        `Your verification code is: ${verificationCode}. It is valid for 10 minutes.`
                    );
                } catch (emailError) {
                    // Email sending failed - log internally if needed
                }
            }

            return res.status(200).json({
                success: false,
                message: shouldSendEmail
                    ? "Please verify your email before logging in. A verification code has been sent to your email."
                    : "Please verify your email before logging in. Check your email for the verification code.",
                needsVerification: true,
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    department: user.department,
                    role: user.role,
                    isVerified: user.isVerified
                }
            });
        }

        // Validate user role
        if (!user.role || !['faculty', 'admin'].includes(user.role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role configuration contact your admin"
            });
        }


        try {
            generateTokenAndSetCookie(user._id, user.role, res);
        } catch (jwtError) {
            return res.status(500).json({
                success: false,
                message: "Login failed. Please try again."
            });
        }

        user.lastLogin = Date.now();
        await user.save({ maxTimeMS: 5000 });


        res.status(200).json({
            success: true,
            message: "Login successful with user role " + user.role,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                department: user.department,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
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

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
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
        } catch (emailError) {
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
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset code"
            });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();


        res.status(200).json({
            success: true,
            message: "Password reset successful"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }

};

// Resend verification code when user visits verify email page
export const resendVerificationCode = async (req, res) => {
    const { email } = req.body;
    try {

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        let verificationToken = user.verificationToken;
        let isNewCode = false;

        // Check if existing code is expired or doesn't exist
        if (!user.verificationToken || !user.verificationTokenExpiresAt || user.verificationTokenExpiresAt < Date.now()) {
            // Generate new verification code only if expired or doesn't exist
            verificationToken = generateVerificationCode();
            user.verificationToken = verificationToken;
            user.verificationTokenExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
            await user.save();
            isNewCode = true;
        }
        // If code is still valid, use the existing one (no need to save)

        // Send verification email with appropriate message
        try {
            const emailSubject = isNewCode ? "New Verification Code" : "Verification Code Reminder";
            const emailMessage = isNewCode
                ? `Your new verification code is: ${verificationToken}. It is valid for 10 minutes.`
                : `Your verification code is: ${verificationToken}. It is still valid. Please use it to verify your account.`;

            await sendEmail(
                user.email,
                emailSubject,
                emailMessage
            );
        } catch (emailError) {
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email"
            });
        }

        res.status(200).json({
            success: true,
            message: isNewCode
                ? "New verification code sent to your email."
                : "Verification code resent to your email."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const checkAuth = async (req, res) => {
    try {

        // Use userId from either req.userId or req.user.userId
        const userId = req.userId || (req.user && req.user.userId);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required - no userId"
            });
        }


        // Add timeout to the database query
        const user = await User.findById(userId).maxTimeMS(5000);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        res.status(200).json({
            success: true,
            message: "User authenticated successfully",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                department: user.department,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error) {

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

