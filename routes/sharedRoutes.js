const express = require("express");
const { shareFile, getSharedFiles } = require("../controllers/sharedController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/share", authMiddleware, shareFile);
router.get("/", authMiddleware, getSharedFiles);

module.exports = router;
