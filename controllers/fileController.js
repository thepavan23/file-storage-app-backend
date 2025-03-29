const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const File = require("../models/File");
const s3 = require("../config/s3");
const multer = require("multer");


const shareFile = async (req, res) => {
    try {
        const { fileId, recipientEmail } = req.body;

        if (!fileId || !recipientEmail) {
            return res.status(400).json({ message: "File ID and recipient email are required" });
        }

        // Find the file in MongoDB
        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        // Prevent duplicate entries in sharedWith array
        if (!file.sharedWith.includes(recipientEmail)) {
            file.sharedWith.push(recipientEmail);
            await file.save();
        }

        res.json({ message: "File shared successfully", file });
    } catch (error) {
        console.error("Error sharing file:", error);
        res.status(500).json({ message: "Error sharing file", error: error.message });
    }
};




const toggleFavourite = async (req, res) => {
    try {
        const { fileId } = req.body;
        const userId = req.user.id; // Ensure authentication middleware sets req.user

        if (!fileId) {
            return res.status(400).json({ message: "File ID is required" });
        }

        // Find the file
        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        // Check if the user has already added it to favorites
        const index = file.favourites.indexOf(userId);
        if (index === -1) {
            // Add to favorites
            file.favourites.push(userId);
        } else {
            // Remove from favorites
            file.favourites.splice(index, 1);
        }

        // Save the updated file document
        await file.save();

        res.json({ message: "Favourite toggled successfully", file });
    } catch (error) {
        console.error("Error toggling favourite:", error);
        res.status(500).json({ message: "Error toggling favourite", error: error.message });
    }
};

const getFavourites = async (req, res) => {
    try {
        const userId = req.user.id; // Ensure req.user is set by authentication middleware

        // Find files where the user ID is in the favourites array
        const favouriteFiles = await File.find({ favourites: userId });

        res.json({ message: "Favourites retrieved successfully", files: favouriteFiles });
    } catch (error) {
        console.error("Error retrieving favourites:", error);
        res.status(500).json({ message: "Error retrieving favourites", error: error.message });
    }
};


const getRecentFiles = async (req, res) => {
    try {
        const userId = req.user.id; // Ensure req.user is set by authentication middleware
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2); // Get date from 2 days ago

        // Find files uploaded by the user in the last 2 days
        const recentFiles = await File.find({
            user: userId,
            createdAt: { $gte: twoDaysAgo }
        }).sort({ createdAt: -1 });

        res.json({ message: "Recent files retrieved successfully", files: recentFiles });
    } catch (error) {
        console.error("Error retrieving recent files:", error);
        res.status(500).json({ message: "Error retrieving recent files", error: error.message });
    }
};


const getCategories = async (req, res) => {
    try {
        const files = await File.find({ user: req.user.id });

        if (!files.length) {
            return res.json([]); // Return an empty array instead of an object
        }

        // Extract unique file types (categories)
        const categories = [...new Set(files.map(file => file.type))];

        res.json(categories); // Return an array of category names
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};


const getFilesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const userId = req.user.id; // Assuming the auth middleware attaches the user info

        // Fetch files that match the given category and belong to the user
        const files = await File.find({ user: userId, type: category });

        res.json(files);
    } catch (error) {
        console.error("Error fetching files by category:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const upload = multer({ storage: multer.memoryStorage() }).single("file");

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileKey = `uploads/${Date.now()}-${req.file.originalname}`;

        console.log("Uploading file with key:", fileKey);

        // Upload file to S3
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        await s3.send(new PutObjectCommand(params));

        // Save file metadata in MongoDB
        const file = new File({
            user: req.user.id, // Ensure authentication middleware sets req.user
            filename: req.file.originalname,
            url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`,
            size: req.file.size,
            type: req.file.mimetype,
        });

        await file.save();

        res.json({ message: "File uploaded successfully", file });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Error uploading file", error: error.message });
    }
};

const getUserFiles = async (req, res) => {
    try {
        const files = await File.find({ user: req.user.id });
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: "Error fetching files" });
    }
};

const downloadFile = async (req, res) => {
    try {
        let fileKey = req.params[0]; // Capture full path after /download/
        
        if (!fileKey) {
            return res.status(400).json({ message: "File key is required" });
        }

        // Decode URL-encoded characters (e.g., spaces)
        fileKey = decodeURIComponent(fileKey);

        console.log("Trying to download file with key:", fileKey);

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
        };

        const data = await s3.send(new GetObjectCommand(params));

        // Extract filename
        const filename = fileKey.split("/").pop();

        // Set headers for download
        res.setHeader("Content-Type", data.ContentType);
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

        data.Body.pipe(res);
    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ message: "Error processing file download", error: error.message });
    }
};


const getSharedFiles = async (req, res) => {
    try {
        const userEmail = req.user.email; // Extract logged-in user's email from token

        console.log("Fetching shared files for user:", userEmail);

        // Find files where the user's email is in the sharedWith array
        const sharedFiles = await File.find({ sharedWith: userEmail });

        if (sharedFiles.length === 0) {
            console.log("No shared files found for:", userEmail);
        }

        res.json({ message: "Shared files retrieved successfully", files: sharedFiles });
    } catch (error) {
        console.error("Error retrieving shared files:", error);
        res.status(500).json({ message: "Error retrieving shared files", error: error.message });
    }
};



module.exports = { uploadFile, getUserFiles, downloadFile, shareFile, toggleFavourite, getFavourites, getRecentFiles, getCategories, getFilesByCategory, getSharedFiles };
