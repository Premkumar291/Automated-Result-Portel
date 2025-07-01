import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    // Ensure req.user is properly set
    req.userId = decoded.userId; // Attach user info to request object
    req.user = { 
      userId: decoded.userId,
      id: decoded.userId // Add id as well for compatibility
    };
    
    console.log('Token verified successfully, req.user:', req.user); // Debug log
    next(); // Call the next middleware

  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: "Unauthorized access" });
  }
};
