const mongoose = require('mongoose');

const deliverableSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  milestoneNumber: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'revision_requested'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  revisionComments: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Deliverable', deliverableSchema);
