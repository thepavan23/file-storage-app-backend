const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    sharedWith: [{ type: String }],
    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    inBin: { type: Boolean, default: false },
    binAddedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("File", FileSchema);