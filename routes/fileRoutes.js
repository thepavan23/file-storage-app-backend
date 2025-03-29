const express = require("express");
const { uploadFile, getUserFiles, shareFile, toggleFavourite, getFavourites, getRecentFiles, getCategories, getFilesByCategory, downloadFile, getSharedFiles } = require("../controllers/fileController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

// Set up multer storage
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/upload", authMiddleware, upload.single("file"), uploadFile);
router.get("/user-files", authMiddleware, getUserFiles);
router.post("/share", authMiddleware, shareFile);
router.post("/favourite", authMiddleware, toggleFavourite);
router.get("/favourites", authMiddleware, getFavourites);
router.get("/recent", authMiddleware, getRecentFiles);
router.get("/categories", authMiddleware, getCategories);
router.get("/download/*", authMiddleware, downloadFile);
router.get('/shared', authMiddleware, getSharedFiles);
router.get("/category/:category", authMiddleware, getFilesByCategory);

module.exports = router;