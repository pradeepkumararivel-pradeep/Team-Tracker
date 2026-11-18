const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['Team Leader', 'Team Member'], default: 'Team Member' },
  token: { type: String, required: true, unique: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Expired'], default: 'Pending' },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);
