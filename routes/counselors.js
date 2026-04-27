/**
 * REST routes for counselors — fully async for MongoDB.
 */
const express           = require('express');
const router            = express.Router();
const store             = require('../../counselor-app-Database/counselor-app-vercel/utils/dataStore');
const validateCounselor = require('../../counselor-app-Database/counselor-app-vercel/middleware/validateCounselor');

// List / search
router.get('/', async (req, res) => {
  try {
    const list = await store.getAll({ search: req.query.search });
    res.json({ count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch counselors' });
  }
});

// Download CSV
router.get('/download', async (req, res) => {
  try {
    const list = await store.getAll();
    const escape = val => {
      const str = (val == null) ? '' : String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const headers = ['id', 'name', 'university', 'phone', 'email', 'image'];
    const csv = [
      headers.join(','),
      ...list.map(c => headers.map(h => escape(c[h])).join(','))
    ].join('\r\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition',
      `attachment; filename="counselors_${new Date().toISOString().slice(0,10)}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate CSV' });
  }
});

// Get one
router.get('/:id', async (req, res) => {
  try {
    const counselor = await store.getById(req.params.id);
    if (!counselor) return res.status(404).json({ error: 'Counselor not found' });
    res.json(counselor);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch counselor' });
  }
});

// Create
router.post('/', validateCounselor(true), async (req, res) => {
  try {
    const created = await store.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create counselor' });
  }
});

// Update (partial)
router.patch('/:id', validateCounselor(false), async (req, res) => {
  try {
    const updated = await store.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Counselor not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update counselor' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await store.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Counselor not found' });
    res.json({ message: 'Counselor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete counselor' });
  }
});

module.exports = router;
