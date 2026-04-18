// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { sendMessage, getMessages, getConversations } = require('../controllers/chatController');

router.post('/send', verifyToken, sendMessage);
router.get('/inbox', verifyToken, getConversations);
router.get('/:otherUserId', verifyToken, getMessages);

module.exports = router;