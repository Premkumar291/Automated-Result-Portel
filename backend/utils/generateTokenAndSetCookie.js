import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, role, res) => {
    // Check if JWT secrets are available
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT configuration error: Missing environment variables');
    }

    try {
        const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000 // 1 hour
        });

        const refreshToken = jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 2592000000 // 30 days
        });

        return token;
    } catch (error) {
        console.error('Error generating JWT tokens:', error);
        throw new Error('Failed to generate authentication tokens');
    }
};