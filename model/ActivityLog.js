// models/ActivityLog.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'applied', 'shortlisted', 'email_sent'
  message: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },   // Optional
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activitySchema);
