// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['seeker', 'recruiter', 'admin', 'user'], 
        default: 'seeker' 
    },
    isPro: { type: Boolean, default: false },
    passwordHistory: {
    type: [String],
    default: []
}
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);