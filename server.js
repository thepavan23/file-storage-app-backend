const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const binRoutes = require("./routes/binRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes");
const categoriesRoutes = require("./routes/categoriesRoutes");
const sharedRoutes = require("./routes/sharedRoutes");
const profileRoutes = require("./routes/profileRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/bin", binRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/shared", sharedRoutes);
app.use("/api/profile", profileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));