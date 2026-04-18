// server/models/Analysis.js
const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    suggestedDomains: [String],
    careerAdvice: [String],
    recommendedJobs: [{
        title: String,
        description: String
    }],
    // Add these two lines inside your Analysis schema:
    atsScore: { type: Number },
    atsSuggestions: [{ type: String }],

    // ⬇️ THIS IS THE CRITICAL MISSING PIECE ⬇️
    missingSkills: [String], 

    date: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Analysis', AnalysisSchema);