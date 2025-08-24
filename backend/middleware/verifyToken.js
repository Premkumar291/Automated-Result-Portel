import jwt from "jsonwebtoken";

// Middleware to verify JWT token
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

    // Ensure req.user is properly set with all necessary information
    req.userId = decoded.userId;
    req.user = {
      _id: decoded.userId,
      userId: decoded.userId,
      id: decoded.userId,
      role: decoded.role // Include role from token
    };
    
    console.log('Token verified successfully, req.user:', req.user); // Debug log
    next(); // Call the next middleware

  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

// Middleware to verify admin role
export const verifyAdmin = (req, res, next) => {
  console.log('Verifying admin role for user:', req.user);
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.log('Unauthorized admin access attempt:', req.user);
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Admin privileges required." 
    });
  }
};

// Middleware to verify faculty role
export const verifyFaculty = (req, res, next) => {
  console.log('Verifying faculty role for user:', req.user);
  if (req.user && req.user.role === 'faculty') {
    next();
  } else {
    console.log('Unauthorized faculty access attempt:', req.user);
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Faculty privileges required." 
    });
  }
};;
