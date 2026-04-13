const express = require('express');
const router = express.Router();
const PolicyHolder = require('../models/PolicyHolder');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET /api/policyholders
router.get('/', async (req, res) => {
  try {
    const policyholders = await PolicyHolder.find();
    res.json(policyholders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/policyholders
router.post('/', async (req, res) => {
  try {
    const policyholder = new PolicyHolder(req.body);
    await policyholder.save();
    res.status(201).json(policyholder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/policyholders/:id
router.get('/:id', async (req, res) => {
  try {
    const policyholder = await PolicyHolder.findById(req.params.id);
    if (!policyholder) return res.status(404).json({ error: 'Not found' });
    res.json(policyholder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/policyholders/:id
router.put('/:id', async (req, res) => {
  try {
    const policyholder = await PolicyHolder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!policyholder) return res.status(404).json({ error: 'Not found' });
    res.json(policyholder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
