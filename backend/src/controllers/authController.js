const bcrypt = require("bcryptjs");

const User = require("../models/User");

const {
    generateAccessToken,
    generateRefreshToken,
} = require("../utils/generateToken");

const signup = async (req,res) => {
    try {
        const {name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;

        await user.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


//Login
const login = async (req,res) => {
    try {

        const { email, password } = req.body;

        console.log("\n========== LOGIN REQUEST ==========");
        console.log("Email:", email);
        console.log("Password:", password);

        const user = await User.findOne({ email });

        console.log("User Found:", !!user);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        console.log("DB Email:", user.email);
        console.log("DB User ID:", user._id);

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        console.log("Password Match:", isMatch);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;

        await user.save();

        console.log("LOGIN SUCCESS");

        res.status(200).json({
            success:true,
            message:"Login Successful",
            accessToken,
            refreshToken,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
            },
        });

    } catch (error) {

        console.log("LOGIN ERROR:", error);

        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

module.exports = {
    signup,
    login,
}

