// Ensure dotenv is loaded first to make sure process.env variables are available
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path'); // Not strictly needed for Cloudinary, but good to keep if you had local storage
const fs = require('fs'); // Not strictly needed for Cloudinary, but good to keep if you had local storage
const http = require('http');
const { Server } = require('socket.io');

// Load Mongoose Models
const User = require('./models/User');
const Proposal = require('./models/Proposal');
const Message = require('./models/Message'); // Assuming your Message model exists and has 'image' field

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URL;

// Verify JWT_SECRET is loaded
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "Yes" : "No", "Length:", process.env.JWT_SECRET?.length);
if (!process.env.JWT_SECRET) {
    console.error("CRITICAL ERROR: JWT_SECRET is not set! Tokens will not be signed/verified correctly.");
    process.exit(1);
}

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware Setup
// Middleware Setup
app.use(cors({
    origin: ["https://promo-1-v4b5.onrender.com", "https://promo-2-ocwm.onrender.com", "https://promo-3.onrender.com"], 
    credentials: true
}));


app.use(bodyParser.json());
app.use(express.json());

// MongoDB Connection
mongoose.connect(mongoUri)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Multer Configuration for Cloudinary Uploads
const upload = multer({
    storage: new CloudinaryStorage({
        cloudinary: cloudinary,
        params: (req, file) => {
            let folderName = 'uploads'; // Default folder
            if (file.fieldname === 'profilePicture') {
                folderName = 'profile_pictures';
            } else if (file.fieldname === 'chatImage') {
                folderName = 'chat_images';
            }
            return {
                folder: folderName,
                format: 'webp', // Or 'png', 'jpg' as per your needs
                public_id: `file_${Date.now()}_${file.originalname.split('.')[0]}`,
            };
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed!'), false);
        }
    },
    limits: { fileSize: 25 * 1024 * 1024 } // 25 MB limit
});

// Authentication Middleware
const requireAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        req.user = user;
        next();
    } catch (err) {
        console.error("JWT verification error:", err.message);
        res.status(403).json({ message: "Invalid token" });
    }
};

// Socket.IO Integration
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5174", "http://localhost:5175"],
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Store connected users: userId -> socket.id
const connectedUsers = {};
// Store typing status: chatId -> { userId: boolean }
const typingStatus = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Register user when they connect
    socket.on('registerUser', (userId) => {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            connectedUsers[userId] = socket.id;
            console.log(`User ${userId} registered with socket ID ${socket.id}`);
            io.emit('onlineUsers', Object.keys(connectedUsers));
        } else {
            console.error('Invalid userId received:', userId);
        }
    });

    // Handle sending messages (text or image URL)
    // The 'data' object here should contain the image URL if it's an image message,
    // which would have been obtained from the /api/chat/upload-image endpoint first.
    socket.on('sendMessage', async (data) => {
        try {
            const { senderId, receiverId, text, imageUrl } = data; // Renamed 'image' to 'imageUrl' for clarity

            // Validate input
            if (!mongoose.Types.ObjectId.isValid(senderId) || 
                !mongoose.Types.ObjectId.isValid(receiverId) || 
                (!text && !imageUrl)) { // Message must have either text or an image URL
                return socket.emit('messageError', 'Invalid message data: missing content or invalid IDs');
            }

            const newMessage = new Message({
                senderId,
                receiverId,
                text: text || null,
                image: imageUrl || null, // Store the Cloudinary URL here
                seen: false, // Messages are initially unseen
                timestamp: new Date()
            });

            await newMessage.save();

            // Populate sender/receiver data for the client
            const populatedMessage = await Message.findById(newMessage._id)
                .populate('senderId', 'name profilePicture')
                .populate('receiverId', 'name profilePicture');

            // Emit to receiver if online
            const receiverSocketId = connectedUsers[receiverId];
            if (receiverSocketId) {
                console.log(`Emitting receiveMessage to online receiver ${receiverId}`);
                io.to(receiverSocketId).emit('receiveMessage', populatedMessage);
            } else {
                console.log(`Receiver ${receiverId} is offline. Message saved to DB.`);
                // No immediate emission for offline users, they will fetch it when they come online
            }

            // Emit to sender for confirmation
            socket.emit('messageSentConfirmation', populatedMessage);

        } catch (error) {
            console.error('Error saving or emitting message:', error);
            socket.emit('messageError', 'Failed to send message');
        }
    });

    // Handle marking messages as seen
    socket.on('markMessagesAsSeen', async (data) => {
        try {
            const { currentUserId, otherUserId } = data;
            
            if (!mongoose.Types.ObjectId.isValid(currentUserId) || 
                !mongoose.Types.ObjectId.isValid(otherUserId)) {
                console.error('Invalid IDs for markMessagesAsSeen:', data);
                return;
            }

            // Mark messages sent by otherUserId to currentUserId as seen
            const result = await Message.updateMany(
                { senderId: otherUserId, receiverId: currentUserId, seen: false },
                { $set: { seen: true } }
            );

            console.log(`Marked ${result.modifiedCount} messages as seen from ${otherUserId} to ${currentUserId}.`);

            // Notify the sender (otherUserId) that their messages have been seen
            const senderSocketId = connectedUsers[otherUserId];
            if (senderSocketId && result.modifiedCount > 0) {
                console.log(`Notifying sender ${otherUserId} that messages were seen.`);
                io.to(senderSocketId).emit('messagesSeenByRecipient', {
                    seenBy: currentUserId,
                    count: result.modifiedCount,
                    senderId: currentUserId, // This is the user who *saw* the messages
                    receiverId: otherUserId // This is the user whose messages were seen
                });
            }
        } catch (error) {
            console.error('Error marking messages as seen:', error);
        }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
        try {
            const { senderId, receiverId } = data;
            
            if (!mongoose.Types.ObjectId.isValid(senderId) || 
                !mongoose.Types.ObjectId.isValid(receiverId)) {
                return;
            }

            const chatId = [senderId, receiverId].sort().join('_');
            if (!typingStatus[chatId]) typingStatus[chatId] = {};
            typingStatus[chatId][senderId] = true;

            const receiverSocketId = connectedUsers[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('typing', senderId);
            }
        } catch (error) {
            console.error('Error handling typing event:', error);
        }
    });

    socket.on('stopTyping', (data) => {
        try {
            const { senderId, receiverId } = data;
            
            if (!mongoose.Types.ObjectId.isValid(senderId) || 
                !mongoose.Types.ObjectId.isValid(receiverId)) {
                return;
            }

            const chatId = [senderId, receiverId].sort().join('_');
            if (typingStatus[chatId] && typingStatus[chatId][senderId]) {
                delete typingStatus[chatId][senderId];
                
                const receiverSocketId = connectedUsers[receiverId];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('stopTyping', senderId);
                }
            }
        } catch (error) {
            console.error('Error handling stopTyping event:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove user from connectedUsers
        const disconnectedUserId = Object.keys(connectedUsers).find(
            userId => connectedUsers[userId] === socket.id
        );
        
        if (disconnectedUserId) {
            delete connectedUsers[disconnectedUserId];
            io.emit('onlineUsers', Object.keys(connectedUsers));
            
            // Clear typing status for this user
            for (const chatId in typingStatus) {
                if (typingStatus[chatId][disconnectedUserId]) {
                    delete typingStatus[chatId][disconnectedUserId];
                    const [user1, user2] = chatId.split('_');
                    const otherUserId = user1 === disconnectedUserId ? user2 : user1;
                    const otherUserSocketId = connectedUsers[otherUserId];
                    if (otherUserSocketId) {
                        io.to(otherUserSocketId).emit('stopTyping', disconnectedUserId);
                    }
                }
            }
        }
    });
});

// Routes
app.get("/", (req, res) => {
    res.send("API is running!");
});

// User Registration (Signup) Route
app.post('/api/users/register', upload.single('profilePicture'), async (req, res) => {
    try {
        const { name, email, password, role, bio, companyName } = req.body;
        let socialMedia = [];

        if (role === 'influencer' && req.body.socialMedia) {
            try {
                socialMedia = JSON.parse(req.body.socialMedia);
                if (!Array.isArray(socialMedia) || socialMedia.some(sm => !sm.platform || !sm.url || !Array.isArray(sm.niche))) {
                    return res.status(400).json({ message: 'Invalid social media data format.' });
                }
            } catch (jsonErr) {
                return res.status(400).json({ message: 'Social media data is malformed JSON.' });
            }
        }

        // Input Validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please fill in all required fields: name, email, password, and role.' });
        }

        if (role === 'business' && !companyName) {
            return res.status(400).json({ message: 'Company name is required for business users.' });
        }

        if (role === 'influencer' && (socialMedia.length === 0 || socialMedia.some(sm => !sm.platform || !sm.url || sm.niche.length === 0))) {
            return res.status(400).json({ message: 'Influencer must provide at least one social media platform with a URL and selected niche(s).' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Prepare User Data
        const userData = {
            name,
            email,
            password: hashedPassword,
            role,
            bio,
            profilePicture: req.file ? req.file.path : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        };

        if (role === 'business') {
            userData.companyName = companyName;
        } else if (role === 'influencer') {
            userData.socialMedia = socialMedia.map(sm => ({
                ...sm,
                followers: sm.followers || 0
            }));
        }

        // Create and Save User
        const newUser = new User(userData);
        await newUser.save();

        // Generate JWT
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '5d' }
        );

        // Success Response
        res.status(201).json({
            message: 'User registered successfully!',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                profilePicture: newUser.profilePicture,
                bio: newUser.bio,
                companyName: newUser.companyName,
                socialMedia: newUser.socialMedia,
                createdAt: newUser.createdAt,
            }
        });

    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
});

// User Login Route
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                bio: user.bio,
                companyName: user.companyName,
                socialMedia: user.socialMedia,
            }
        });

    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});

// Get User Profile
app.get('/api/user/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password -__v');

        if (!user) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        const profileData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePictureUrl: user.profilePicture,
            bio: user.bio,
            createdAt: user.createdAt,
        };

        if (user.role === 'business') {
            profileData.companyName = user.companyName;
        } else if (user.role === 'influencer') {
            profileData.socialMedia = user.socialMedia;
            profileData.favorites = user.favorites;
            profileData.connections = user.connections;
        }

        res.json(profileData);

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
});

// API Route for Searching Influencers
app.post('/influencers', async (req, res) => {
    try {
        const { selectedPlatforms, selectedNiches } = req.body;

        const queryCriteria = {
            role: 'influencer'
        };

        if (selectedPlatforms && selectedPlatforms.length > 0) {
            queryCriteria['socialMedia.platform'] = { $in: selectedPlatforms };
        }

        if (selectedNiches && selectedNiches.length > 0) {
            queryCriteria['socialMedia.niche'] = { $in: selectedNiches };
        }

        let influencers = await User.find(queryCriteria).lean();

        // Calculate totalFollowers and format socialMedia
        influencers = influencers.map(influencer => {
            const totalFollowers = influencer.socialMedia.reduce((sum, sm) => sum + (sm.followers || 0), 0);

            const formattedSocialMedia = influencer.socialMedia.map(sm => ({
                platform: sm.platform,
                url: sm.url,
                accountUrl: sm.url,
                followers: sm.followers || 0,
                niches: sm.niche || [],
            }));

            return {
                ...influencer,
                id: influencer._id,
                photo: influencer.profilePicture,
                totalFollowers: totalFollowers,
                socialMedia: formattedSocialMedia
            };
        });

        res.status(200).json(influencers);

    } catch (error) {
        console.error('Error fetching influencers:', error);
        res.status(500).json({ message: 'Server error fetching influencers.', error: error.message });
    }
});

// Favorite / Connect routes
app.post("/api/favorite", requireAuth, async (req, res) => {
    const { influencerId } = req.body;
    const user = req.user;
    if (!user.favorites.includes(influencerId)) {
        user.favorites.push(influencerId);
        await user.save();
    }
    res.json({ message: "Favorited" });
});

app.get("/api/favorites", requireAuth, async (req, res) => {
    try {
        const user = req.user;
        const populatedUser = await User.findById(user._id).populate({
            path: "favorites",
            select: "name bio socialMedia profilePicture email role",
        });
        res.status(200).json({
            favorites: populatedUser.favorites,
        });
    } catch (err) {
        console.error("Error fetching favorites:", err);
        res.status(500).json({ message: "Server error fetching favorites" });
    }
});

// Remove influencer from favorites
app.delete("/api/favorite/:influencerId", requireAuth, async (req, res) => {
    const influencerId = req.params.influencerId;
    if (!influencerId) {
        return res.status(400).json({ message: "Influencer ID is required" });
    }
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.favorites = user.favorites.filter(
            (id) => id.toString() !== influencerId
        );
        await user.save();
        return res.status(200).json({ message: "Unfavorited successfully" });
    } catch (err) {
        console.error("Unfavorite Error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

// Send Proposal
app.post("/api/proposals", requireAuth, async (req, res) => {
    const {
        receiver,
        campaignName,
        description,
        budget,
        deliverables,
        timeline,
    } = req.body;

    try {
        const prop = new Proposal({
            sender: req.user._id,
            receiver: receiver,
            campaignName: campaignName,
            description: description,
            budget: budget,
            deliverables: deliverables,
            timeline: timeline,
        });

        await prop.save();
        res.status(201).json({ message: "Proposal sent successfully!", proposal: prop });
    } catch (err) {
        console.error("Error sending proposal:", err);
        res.status(500).json({ message: "Server error: Failed to send proposal" });
    }
});

app.get("/api/proposals/sent", requireAuth, async (req, res) => {
    try {
        const senderId = req.user._id;

        const proposals = await Proposal.find({ sender: senderId, status: 'pending' })
            .populate({
                path: "receiver",
                select: "name profilePicture email socialMedia.platform socialMedia.url socialMedia.niche",
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ proposals });
    } catch (err) {
        console.error("Error fetching sent proposals:", err);
        res.status(500).json({ message: "Server error fetching sent proposals" });
    }
});

app.post("/api/connect", requireAuth, async (req, res) => {
    const { influencerId } = req.body;
    const user = req.user;
    try {
        const influencer = await User.findById(influencerId);
        if (!influencer) {
            return res.status(404).json({ message: "Influencer not found." });
        }
        if (user._id.toString() === influencer._id.toString()) {
            return res.status(400).json({ message: "Cannot connect to yourself." });
        }
        const isUserAlreadyConnected = user.connections.includes(influencer._id);
        if (isUserAlreadyConnected) {
            return res.status(409).json({ message: "Conflict: Already connected to this influencer." });
        } else {
            user.connections.push(influencer._id);
            influencer.connections.push(user._id);
            await user.save();
            await influencer.save();
            return res.status(200).json({ message: "Connected successfully!" });
        }
    } catch (error) {
        console.error("Error during connection:", error);
        return res.status(500).json({ message: "Server error during connection." });
    }
});

// Get current user details AND populate connections
app.get('/api/me', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('connections', 'name profilePicture email bio socialMedia role');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Received Proposals (ONLY PENDING ones for influencer's "Proposals" tab)
app.get('/api/proposals/received', requireAuth, async (req, res) => {
    try {
        const influencerId = req.user.id;

        if (req.user.role !== 'influencer') {
            return res.status(403).json({ message: 'Access denied. Only influencers can view received proposals.' });
        }

        const proposals = await Proposal.find({ receiver: influencerId, status: 'pending' })
            .populate('sender', 'name companyName profilePicture email')
            .sort({ createdAt: -1 });

        res.status(200).json(proposals);
    } catch (err) {
        console.error("Error fetching received (pending) proposals:", err);
        res.status(500).json({ message: 'Server error fetching proposals.', error: err.message });
    }
});

app.put('/api/proposals/:id/status', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        const proposal = await Proposal.findById(id);

        if (!proposal) {
            return res.status(404).json({ message: 'Proposal not found' });
        }

        if (userRole !== 'influencer' || proposal.receiver.toString() !== userId) {
            return res.status(403).json({ message: 'Access denied. You are not authorized to update this proposal status.' });
        }

        if (status === 'accepted') {
            if (proposal.status !== 'pending') {
                return res.status(400).json({ message: 'Only pending proposals can be accepted.' });
            }
        } else if (status === 'completed') {
            if (proposal.status !== 'accepted') {
                return res.status(400).json({ message: 'Only accepted proposals can be marked as completed.' });
            }
        } else {
            return res.status(400).json({ message: 'Invalid status provided or transition not allowed.' });
        }

        proposal.status = status;
        proposal.updatedAt = Date.now();
        await proposal.save();

        res.status(200).json({ message: 'Proposal status updated successfully', status: proposal.status, updatedAt: proposal.updatedAt });

    } catch (err) {
        console.error("Error updating proposal status:", err);
        res.status(500).json({ message: 'Server error updating proposal status.', error: err.message });
    }
});

app.get('/api/projects', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let projects;

        if (userRole === 'influencer') {
            projects = await Proposal.find({
                receiver: userId,
                status: 'accepted'
            })
                .populate('sender', 'name companyName profilePicture email')
                .sort({ updatedAt: -1 });
        } else if (userRole === 'business') {
            projects = await Proposal.find({
                sender: userId,
                status: 'accepted'
            })
                .populate('receiver', 'name profilePicture socialMedia bio email')
                .sort({ updatedAt: -1 });
        } else {
            return res.status(403).json({ message: 'Access denied. Invalid user role.' });
        }

        res.status(200).json(projects);

    } catch (err) {
        console.error("Error fetching active projects:", err);
        res.status(500).json({ message: 'Server error fetching projects.', error: err.message });
    }
});

app.get('/api/history', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let historyProjects;

        if (userRole === 'influencer') {
            historyProjects = await Proposal.find({
                receiver: userId,
                status: 'completed'
            })
                .populate('sender', 'name companyName profilePicture email')
                .sort({ updatedAt: -1 });
        } else if (userRole === 'business') {
            historyProjects = await Proposal.find({
                sender: userId,
                status: 'completed'
            })
                .populate('receiver', 'name profilePicture socialMedia bio email')
                .sort({ updatedAt: -1 });
        } else {
            return res.status(403).json({ message: 'Access denied. Invalid user role.' });
        }

        res.status(200).json(historyProjects);

    } catch (err) {
        console.error("Error fetching project history:", err);
        res.status(500).json({ message: 'Server error fetching project history.', error: err.message });
    }
});

// API endpoint to upload chat images
// This endpoint is for uploading the image file to Cloudinary.
// The URL returned from this endpoint should then be used in the 'sendMessage' Socket.IO event.
app.post('/api/chat/upload-image', requireAuth, upload.single('chatImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded.' });
        }
        // req.file.path contains the Cloudinary URL
        res.status(200).json({ 
            imageUrl: req.file.path,
            message: 'Image uploaded successfully.' 
        });
    } catch (error) {
        console.error('Error uploading chat image:', error);
        res.status(500).json({ message: 'Server error uploading image.' });
    }
});

// API endpoint to fetch messages between two users
// This is critical for loading past messages, especially for offline delivery.
app.get('/api/messages/:otherUserId', requireAuth, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const otherUserId = req.params.otherUserId;

        if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
            return res.status(400).json({ message: 'Invalid recipient ID.' });
        }

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: currentUserId }
            ]
        })
            .sort({ timestamp: 1 })
            .populate('senderId', 'name profilePicture')
            .populate('receiverId', 'name profilePicture');

        // After fetching, you might want to mark as seen.
        // However, it's generally better for the frontend to explicitly send a 'markMessagesAsSeen' event
        // once it has rendered the messages, to avoid race conditions or marking prematurely.
        
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error fetching messages.' });
    }
});


// Start the HTTP server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO listening on port ${PORT}`);
});
