// server/models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    recruiterId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    //createdAt:{type: String},
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    lat: { type: Number }, // 🌟 NEW: Latitude 
    lng: { type: Number }, // 🌟 NEW: Longitude
    type: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract', 'Remote'], default: 'Full-Time' },
    salary: { type: String },
    
    // The Matching Keys
    domain: { type: String, required: true }, // e.g., "Web Development", "Data Science"
    requiredSkills: [String], // e.g., ["React", "Node.js", "MongoDB"]
    
    description: { type: String, required: true },
    postedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Job', JobSchema);