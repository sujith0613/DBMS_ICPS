const express = require('express');
const router = express.Router();
const ClaimReview = require('../models/ClaimReview');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');
const { auth } = require('../middleware/auth');

router.use(auth);

// Claim Reviews
router.get('/claim_reviews', async (req, res) => {
  try {
    const match = {};
    if (req.query.claim_id) match.claim_id = req.query.claim_id;
    if (req.query.surveyor_id) match.surveyor_id = req.query.surveyor_id;

    // Role-based filtering
    if (req.user.role === 'surveyor') {
      match.surveyor_id = req.user.reference_id;
    } else if (req.user.role === 'policyholder') {
      // Find claims for this policyholder
      const Claim = mongoose.model('Claim');
      const Policy = mongoose.model('Policy');
      const policies = await Policy.find({ policy_holder_id: req.user.reference_id });
      const policyIds = policies.map(p => p._id);
      const claims = await Claim.find({ policy_id: { $in: policyIds } });
      const claimIds = claims.map(c => c._id);
      match.claim_id = { $in: claimIds };
    }

    const reviews = await ClaimReview.find(match).populate('surveyor_id', 'name license_no');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/claim_reviews', async (req, res) => {
  try {
    const review = new ClaimReview(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Payments
router.get('/payments', async (req, res) => {
  try {
    const match = {};
    if (req.query.claim_id) match.claim_id = req.query.claim_id;

    if (req.user.role === 'policyholder') {
        const Claim = mongoose.model('Claim');
        const Policy = mongoose.model('Policy');
        const policies = await Policy.find({ policy_holder_id: req.user.reference_id });
        const policyIds = policies.map(p => p._id);
        const claims = await Claim.find({ policy_id: { $in: policyIds } });
        const claimIds = claims.map(c => c._id);
        match.claim_id = { $in: claimIds };
    } else if (req.user.role === 'service_provider') {
        const Claim = mongoose.model('Claim');
        const claims = await Claim.find({ provider_id: req.user.reference_id });
        const claimIds = claims.map(c => c._id);
        match.claim_id = { $in: claimIds };
    }

    const payments = await Payment.find(match);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/payments', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
