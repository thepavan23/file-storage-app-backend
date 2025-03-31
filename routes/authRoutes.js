const express = require("express");
const { register, login, getUser } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", authMiddleware, getUser);
router.post("/verify-email", async (req, res) => {
    try {
        console.log("🔍 Received request body:", req.body); // Debugging

        const { email, code } = req.body;
        if (!email) {
            console.log("❌ Email is missing in request body");
            return res.status(400).json({ message: "Email is required" });
        }

        console.log("🔍 Verifying email:", email, "with code:", code);

        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ User not found:", email);
            return res.status(400).json({ message: "User not found" });
        }

        console.log("✅ User found:", user.email);
        console.log("🔑 Stored verification code (hashed):", user.verificationCode);

        const isCodeValid = await bcrypt.compare(code, user.verificationCode);
        console.log("🔍 Verification code match:", isCodeValid);

        if (!isCodeValid) {
            console.log("❌ Invalid verification code entered.");
            return res.status(400).json({ message: "Invalid verification code" });
        }

        user.isVerified = true;
        user.verificationCode = null; // Remove the code after verification
        await user.save();

        console.log("✅ Email verified successfully!");
        res.status(200).json({ message: "Email verified successfully!" });

    } catch (error) {
        console.error("❌ Error verifying email:", error);
        res.status(500).json({ message: "Error verifying email", error: error.message });
    }
});



module.exports = router;
