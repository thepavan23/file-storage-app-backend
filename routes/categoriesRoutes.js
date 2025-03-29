const express = require("express");
const { getCategories } = require("../controllers/fileController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getCategories);

module.exports = router;
