const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// Register User
const registerUser = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Login User
const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get Profile
const getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Upload Avatar
const uploadAvatar = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    user.avatar = req.file.path;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar: user.avatar,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email avatar");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  uploadAvatar,
  getAllUsers,
};