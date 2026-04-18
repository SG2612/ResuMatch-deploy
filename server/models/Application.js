// server/models/Application.js
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumePath: { type: String, required: true }, // Where the PDF is saved
    status: { type: String, default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);