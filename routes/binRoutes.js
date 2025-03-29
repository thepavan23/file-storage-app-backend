const express = require("express");
const { moveToBin, restoreFromBin, getBinFiles, deleteExpiredFiles } = require("../controllers/binController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.delete("/move", authMiddleware, moveToBin);
router.post("/restore", authMiddleware, restoreFromBin);
router.get("/", authMiddleware, getBinFiles);

module.exports = router;