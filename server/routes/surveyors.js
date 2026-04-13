const express = require('express');
const router = express.Router();
const Surveyor = require('../models/Surveyor');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET /api/surveyors
router.get('/', async (req, res) => {
  try {
    const surveyors = await Surveyor.find();
    res.json(surveyors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/surveyors/:id
router.get('/:id', async (req, res) => {
  try {
    const surveyor = await Surveyor.findById(req.params.id);
    if (!surveyor) return res.status(404).json({ error: 'Not found' });
    res.json(surveyor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
