const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m",
        }
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        {
            expiresIn : "7d",
        }
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
};