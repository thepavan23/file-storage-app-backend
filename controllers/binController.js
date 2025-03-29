const File = require("../models/File");

const moveToBin = async (req, res) => {
    try {
        const file = await File.findOne({ _id: req.body.fileId, user: req.user.id });
        if (!file) return res.status(404).json({ message: "File not found" });
        
        file.inBin = true;
        file.binAddedAt = new Date();
        await file.save();

        res.json({ message: "File moved to bin" });
    } catch (error) {
        res.status(500).json({ message: "Error moving file to bin" });
    }
};

const restoreFromBin = async (req, res) => {
    try {
        const file = await File.findOne({ _id: req.body.fileId, user: req.user.id, inBin: true });
        if (!file) return res.status(404).json({ message: "File not found in bin" });
        
        file.inBin = false;
        file.binAddedAt = null;
        await file.save();

        res.json({ message: "File restored from bin" });
    } catch (error) {
        res.status(500).json({ message: "Error restoring file from bin" });
    }
};

const getBinFiles = async (req, res) => {
    try {
        const files = await File.find({ user: req.user.id, inBin: true });
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bin files" });
    }
};

const deleteExpiredFiles = async () => {
    const THIRTY_DAYS_AGO = new Date();
    THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);
    
    try {
        await File.deleteMany({ inBin: true, binAddedAt: { $lte: THIRTY_DAYS_AGO } });
        console.log("Expired files deleted");
    } catch (error) {
        console.error("Error deleting expired files", error);
    }
};

setInterval(deleteExpiredFiles, 24 * 60 * 60 * 1000); // Run daily

module.exports = { moveToBin, restoreFromBin, getBinFiles, deleteExpiredFiles };
