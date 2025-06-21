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

    req.userId = decoded.userId; // Attach user info to request object
    next(); // Call the next middleware

  } catch (error) {
    res.status(401).json({ message: "Unauthorized access" });
  }
};
