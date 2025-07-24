const express = require('express');
const router = express.Router();

// Simple GET route
router.get('/', async (req, res) => {
  try {
    const { limit = 10, search } = req.query;
    res.json({ 
      message: 'Simple endpoint',
      limit: parseInt(limit),
      search: search || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple POST route
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    res.status(201).json({ 
      id: Date.now(),
      name,
      description,
      created: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Simple GET by ID route
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ id, name: `Item ${id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;