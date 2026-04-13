const express = require('express');
const router = express.Router();
const ServiceProvider = require('../models/ServiceProvider');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET /api/service-providers
router.get('/', async (req, res) => {
  try {
    const providers = await ServiceProvider.find();
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/service-providers/:id
router.get('/:id', async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) return res.status(404).json({ error: 'Not found' });
    res.json(provider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
