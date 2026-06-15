const express = require("express");

const router = express.Router();

const authLimiter = require("../middleware/rateLimiter");

const {
    signup,
    login,
} = require("../controllers/authController");

router.post("/signup", authLimiter, signup);
router.post("/login",authLimiter, login);

module.exports = router;