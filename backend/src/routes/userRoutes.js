const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
  registerUser,
  loginUser,
  getProfile,
  uploadAvatar,
  getAllUsers,
} = require("../controllers/userController");


// Register Route
router.post("/register", registerUser);


// Login Route
router.post("/login", loginUser);


// Protected Profile Route
router.get("/profile", protect, getProfile);


// Get All Users Route
router.get("/", protect, getAllUsers);


// Upload Avatar Route
router.post(
  "/avatar",
  protect,
  upload.single("avatar"),
  uploadAvatar
);

module.exports = router;