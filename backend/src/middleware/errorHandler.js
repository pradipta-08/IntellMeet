// src/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error("🔴 Server Error:", err.stack || err.message);

  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only show stack trace in development mode
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;