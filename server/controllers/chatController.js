// server/controllers/chatController.js
const Message = require('../models/Message');
const User = require('../models/User');

// 1. Send a message
const sendMessage = async (req, res) => {
    try {
        const { receiverId, text } = req.body;
        const newMessage = await Message.create({
            sender: req.user.id,
            receiver: receiverId,
            text
        });
        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        res.status(500).json({ error: "Failed to send message." });
    }
};

// 2. Get chat history between the logged-in user and ONE specific person
const getMessages = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: otherUserId },
                { sender: otherUserId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 }); // Oldest to newest for chat flow
        
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ error: "Failed to load messages." });
    }
};

// 3. Get the "Inbox" list (everyone the user has chatted with)
const getConversations = async (req, res) => {
    try {
        // Find all messages involving this user
        const messages = await Message.find({
            $or: [{ sender: req.user.id }, { receiver: req.user.id }]
        })
        .populate('sender', 'name role')
        .populate('receiver', 'name role')
        .sort({ createdAt: -1 }); // Newest first

        // Extract unique contacts
        const contactsMap = new Map();
        messages.forEach(msg => {
            // Determine who the "other" person is
            const isSender = msg.sender._id.toString() === req.user.id;
            const otherPerson = isSender ? msg.receiver : msg.sender;
            
            // If we haven't added this person to the inbox list yet, add them!
            if (otherPerson && !contactsMap.has(otherPerson._id.toString())) {
                 contactsMap.set(otherPerson._id.toString(), {
                     _id: otherPerson._id,
                     name: otherPerson.name,
                     role: otherPerson.role,
                     lastMessage: msg.text,
                     date: msg.createdAt
                 });
            }
        });

        res.status(200).json({ success: true, data: Array.from(contactsMap.values()) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to load inbox." });
    }
};

module.exports = { sendMessage, getMessages, getConversations };