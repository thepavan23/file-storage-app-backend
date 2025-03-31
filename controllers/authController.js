const User = require("../models/User");
const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

const router = express.Router();

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });

        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ message: "Email already exists" });
            }

            // If the user exists but is not verified, update their verification code
            const verificationCode = crypto.randomInt(100000, 999999).toString();
            const hashedCode = await bcrypt.hash(verificationCode, 10);

            user.name = name;
            user.password = password; // Update password
            user.verificationCode = hashedCode;

            await user.save();

            // Send email with new verification code
            await sendEmail(email, "Verify Your Email", `Your new verification code is: ${verificationCode}`);

            return res.status(200).json({ message: "A new verification code has been sent to your email. Please verify your account." });
        }

        // If the user does not exist, create a new one
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const hashedCode = await bcrypt.hash(verificationCode, 10);

        user = new User({
            name,
            email,
            password: hashedPassword,
            verificationCode: hashedCode,
        });

        await user.save();

        // Send email with verification code
        await sendEmail(email, "Verify Your Email", `Your verification code is: ${verificationCode}`);

        res.status(201).json({ message: "Signup successful! Please check your email for the verification code." });

    } catch (error) {
        console.error("❌ Error signing up:", error);
        res.status(500).json({ message: "Error signing up", error });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("🔍 Login Attempt:", { email, password });

        const user = await User.findOne({ email });
        if (!user) {
            console.error("❌ User not found:", email);
            return res.status(401).json({ message: "User not found" });
        }

        console.log("✅ User found:", user.email);
        console.log("🔑 Stored password (hashed):", user.password);

        // Check if the user is verified
        if (!user.isVerified) {
            console.error("❌ User not verified:", email);
            return res.status(403).json({ message: "Email not verified. Please verify your email before logging in." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.error("❌ Invalid password for:", email);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("✅ Login successful for:", user.email);
        res.json({ token });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ message: "Error logging in" });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user data" });
    }
};

module.exports = { register, login, getUser };