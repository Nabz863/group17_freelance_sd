const express = require('express');
const { jwtCheck, checkRole } = require('../middleware/auth.middleware');
const { Deliverable } = require('../models/deliverable.model');
const { Contract } = require('../models/contract.model');

const router = express.Router();

// Submit deliverable for a milestone
router.post(
  '/:contractId/milestone/:milestoneNumber',
  jwtCheck,
  checkRole(['freelancer']),
  async (req, res) => {
    try {
      const { description, files } = req.body;
      const { contractId, milestoneNumber } = req.params;

      // Check if user is the assigned freelancer for this contract
      const contract = await Contract.findById(contractId);
      if (!contract || contract.freelancerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const deliverable = new Deliverable({
        contractId,
        milestoneNumber,
        description,
        files,
        submittedBy: req.user._id
      });

      await deliverable.save();
      res.json({ success: true, deliverable });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get deliverables for a contract
router.get(
  '/:contractId',
  jwtCheck,
  async (req, res) => {
    try {
      const { contractId } = req.params;
      const deliverables = await Deliverable.find({ contractId })
        .populate('submittedBy', 'name email')
        .populate('approvedBy', 'name email')
        .populate('files');

      res.json({ success: true, deliverables });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Approve or request revision for a deliverable
router.patch(
  '/:deliverableId',
  jwtCheck,
  checkRole(['client']),
  async (req, res) => {
    try {
      const { deliverableId } = req.params;
      const { action, comments } = req.body;

      const deliverable = await Deliverable.findById(deliverableId)
        .populate('contractId');

      if (!deliverable) {
        return res.status(404).json({ success: false, message: 'Deliverable not found' });
      }

      // Check if user is the client for this contract
      if (deliverable.contractId.clientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      if (action === 'approve') {
        deliverable.status = 'approved';
        deliverable.approvedBy = req.user._id;
        deliverable.approvedAt = new Date();
      } else if (action === 'revision') {
        deliverable.status = 'revision_requested';
        deliverable.revisionComments = comments;
      }

      await deliverable.save();
      res.json({ success: true, deliverable });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
