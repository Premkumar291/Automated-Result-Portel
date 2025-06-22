import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
    console.log('Generating JWT token for user:', userId);
    
    // Check if JWT secrets are available
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        throw new Error('JWT configuration error');
    }
    
    if (!process.env.JWT_REFRESH_SECRET) {
        console.error('JWT_REFRESH_SECRET is not defined in environment variables');
        throw new Error('JWT configuration error');
    }

    try {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('JWT token generated successfully');
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000
        });

        const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
        console.log('JWT refresh token generated successfully');
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 2592000000 // 30 days
        });

        console.log('Cookies set successfully');
        return token;
    } catch (error) {
        console.error('Error generating JWT tokens:', error);
        throw new Error('Failed to generate authentication tokens');
    }
};