import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (user, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '1h'});
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'Strict', // Prevent CSRF attacks
        maxAge: 3600000 // 1 hour
    });

    return token;
};