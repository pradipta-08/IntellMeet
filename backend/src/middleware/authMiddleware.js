const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {

    let token;

    // Check Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      // Get token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      console.log("Decoded JWT payload:", decoded);

      // Find user
      const user = await User.findById(decoded.id || decoded.userId);

      if (!user) {
        console.error("Auth Error: User not found in MongoDB for decoded ID:", decoded.id || decoded.userId);
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Attach user to request
      req.user = user;

      next();

    } else {
      console.error("Auth Error: No authorization header or Bearer token found.");
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

  } catch (error) {
    console.error("Auth Error: JWT validation failed -", error.message);
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = protect;