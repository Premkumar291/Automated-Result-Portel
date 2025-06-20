import bcrypt from "bcryptjs";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import {generateTokenAndSetCookie} from "../utils/generateTokenAndSetCookie.js";
import { User } from '../models/user.model.js';

export const signup = async (req,res) => {
    const {email , password , name} = req.body;
    try {
        if (!email || !password || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userAlreadyExists = await User.findOne({ email });

        if(userAlreadyExists) {
            return res.status(400).json({ success:false ,message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationCode();

        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken ,
            verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        await newUser.save();

        //jwt authentication 
        generateTokenAndSetCookie(res, newUser._id);

        res.status(201).json({
          success: true,
          message: "User created successfully",
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

export const login = async (req,res) => {
    res.send("log in route");
};

export const logout = async (req,res) => {
    res.send("log out route");
};