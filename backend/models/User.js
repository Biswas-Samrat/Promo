// models/User.js (No changes needed, already supports connections)
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["business", "influencer"], required: true },
    profilePicture: {
        type: String,
        default:
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    bio: { type: String },
    companyName: { type: String },
    socialMedia: [
        {
            platform: {
                type: String,
                enum: [
                    "Instagram", "YouTube", "TikTok", "Twitter",
                    "Facebook", "LinkedIn", "Snapchat",
                ],
                required: true,
            },
            url: { type: String, required: true },
            niche: [{ type: String }],
        },
    ],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // This is correct for contacts

    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);