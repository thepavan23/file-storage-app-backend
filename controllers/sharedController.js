const File = require("../models/File");

const shareFile = async (req, res) => {
    try {
        const { fileId, recipientEmail } = req.body;
        const file = await File.findById(fileId);
        if (!file) return res.status(404).json({ message: "File not found" });

        file.sharedWith.push(recipientEmail);
        await file.save();

        res.json({ message: "File shared successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error sharing file" });
    }
};

const getSharedFiles = async (req, res) => {
    try {
        const files = await File.find({ sharedWith: req.user.email });
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: "Error fetching shared files" });
    }
};

module.exports = { shareFile, getSharedFiles };
