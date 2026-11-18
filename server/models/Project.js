const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Project title is required'], trim: true },
  description: { type: String, required: [true, 'Project description is required'] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['Planning', 'Active', 'On Hold', 'Completed'],
    default: 'Active'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  deadline: { type: Date, required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

projectSchema.index({ owner: 1, members: 1 });

module.exports = mongoose.model('Project', projectSchema);
