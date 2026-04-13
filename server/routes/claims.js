const express = require('express');
const router = express.Router();
const Claim = require('../models/Claim');
const upload = require('../middleware/upload');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

router.use(auth);

// GET /api/claims
router.get('/', async (req, res) => {
  try {
    const match = {};
    if (req.query.claim_status) match.claim_status = req.query.claim_status;
    if (req.query.event_id) match.event_id = req.query.event_id;
    if (req.query.provider_id) match.provider_id = req.query.provider_id;

    // Role-based filtering
    if (req.user.role === 'policyholder') {
      // Find all policies for this holder
      const Policy = mongoose.model('Policy');
      const policies = await Policy.find({ policy_holder_id: req.user.reference_id });
      const policyIds = policies.map(p => p._id);
      match.policy_id = { $in: policyIds };
    } else if (req.user.role === 'service_provider') {
      match.provider_id = req.user.reference_id;
    } else if (req.user.role === 'surveyor') {
      // Surveyors see claims they have reviewed or are assigned to.
      // For now, let's allow them to see claims that have reviews by them.
      const ClaimReview = mongoose.model('ClaimReview');
      const reviews = await ClaimReview.find({ surveyor_id: req.user.reference_id });
      const reviewedClaimIds = reviews.map(r => r.claim_id);
      match._id = { $in: reviewedClaimIds };
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const claims = await Claim.find(match)
      .populate({
        path: 'policy_id',
        select: 'policy_number',
        populate: { path: 'policy_holder_id', select: 'name' }
      })
      .populate('event_id', 'event_name risk_level')
      .populate('provider_id', 'provider_name')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ claim_date: -1 });

    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/claims
router.post('/', async (req, res) => {
  try {
    const claimData = { ...req.body };
    if (!claimData.status_history) {
      claimData.status_history = [{
        status_id: new mongoose.Types.ObjectId().toString(),
        status: claimData.claim_status || 'Submitted',
        status_date: new Date(),
        updated_by: req.user ? req.user.role : 'System'
      }];
    }
    const claim = new Claim(claimData);
    await claim.save();
    res.status(201).json(claim);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/claims/:id
router.get('/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate({
        path: 'policy_id',
        populate: { path: 'policy_holder_id branch_id' }
      })
      .populate('event_id')
      .populate('provider_id');
      
    if (!claim) return res.status(404).json({ error: 'Not found' });
    res.json(claim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/claims/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, updated_by } = req.body;
    const actor = req.user ? req.user.role : (updated_by || 'System');
    
    const statusEntry = {
      status_id: new mongoose.Types.ObjectId().toString(),
      status: status,
      status_date: new Date(),
      updated_by: actor
    };

    // Atomic update
    const claim = await Claim.findOneAndUpdate(
      { _id: req.params.id },
      { 
        $set: { claim_status: status },
        $push: { status_history: statusEntry }
      },
      { new: true }
    );

    if (!claim) return res.status(404).json({ error: 'Not found' });
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('claim_status_updated', {
        claim_id: claim._id,
        claim_number: claim.claim_number,
        new_status: status,
        updated_by: actor
      });
    }

    res.json(claim);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/claims/:id/documents
router.post('/:id/documents', upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { document_type } = req.body;

    const newDocs = files.map(file => {
      const fileId = file.id || file._id || file.filename;
      return {
        document_id: fileId.toString(),
        file_path: `/api/documents/${fileId}`,
        document_type: document_type || 'General',
        upload_date: new Date()
      };
    });

    const claim = await Claim.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { documents: { $each: newDocs } } },
      { new: true }
    );

    if (!claim) return res.status(404).json({ error: 'Not found' });
    
    res.json({ message: 'Documents uploaded', documents: newDocs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
