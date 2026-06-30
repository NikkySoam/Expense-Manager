const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['alert', 'info', 'summary'], default: 'info' },
  read: { type: Boolean, default: false },
  month: { type: String }, // e.g., '2026-06'
  year: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
