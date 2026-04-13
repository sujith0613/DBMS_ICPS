const express = require('express');
const router = express.Router();
const Policy = require('../models/Policy');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET /api/policies
router.get('/', async (req, res) => {
  try {
    const match = {};
    if (req.query.policy_holder_id) match.policy_holder_id = req.query.policy_holder_id;
    if (req.query.branch_id) match.branch_id = req.query.branch_id;
    if (req.query.event_id) match.event_id = req.query.event_id;

    // Role-based filtering
    if (req.user.role === 'policyholder') {
      match.policy_holder_id = req.user.reference_id;
    } else if (req.user.role === 'branch_manager') {
      match.branch_id = req.user.reference_id;
    }

    // Additional query params page, limit
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const policies = await Policy.find(match)
      .populate('policy_holder_id', 'name')
      .populate('branch_id', 'branch_name')
      .populate('event_id', 'event_name risk_level')
      .skip((page - 1) * limit)
      .limit(limit);
      
    res.json(policies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/policies
router.post('/', async (req, res) => {
  try {
    const policy = new Policy(req.body);
    await policy.save();
    res.status(201).json(policy);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/policies/:id
router.get('/:id', async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('policy_holder_id')
      .populate('branch_id')
      .populate('event_id');
    if (!policy) return res.status(404).json({ error: 'Not found' });
    res.json(policy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/policies/:id
router.put('/:id', async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!policy) return res.status(404).json({ error: 'Not found' });
    res.json(policy);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
