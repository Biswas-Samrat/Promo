// models/Message.js
const mongoose = require("mongoose"); // Use require() for CommonJS

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },   // Keep 'text' as per your original schema, consistent with frontend
    image: { type: String },  // Keep 'image' as per your original schema, consistent with frontend
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message; // Use module.exports for CommonJS