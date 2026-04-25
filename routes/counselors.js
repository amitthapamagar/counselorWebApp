/**
 * REST routes for counselors.
 *
 *  GET    /api/counselors          — list (supports ?search=)
 *  GET    /api/counselors/download — download all as CSV
 *  GET    /api/counselors/:id      — get one
 *  POST   /api/counselors          — create
 *  PATCH  /api/counselors/:id      — update (partial)
 *  DELETE /api/counselors/:id      — delete
 */
const express           = require('express');
const router            = express.Router();
const store             = require('../utils/dataStore');
const validateCounselor = require('../middleware/validateCounselor');

// List / search
router.get('/', (req, res) => {
  const { search } = req.query;
  const list = store.getAll({ search });
  res.json({ count: list.length, data: list });
});

// Download all counselors as CSV
router.get('/download', (req, res) => {
  const list = store.getAll();

  const escape = val => {
    const str = (val === undefined || val === null) ? '' : String(val);
    // Wrap in quotes if value contains a comma, quote, or newline
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const headers = ['id', 'name', 'university', 'phone', 'email', 'image'];
  const rows = list.map(c => headers.map(h => escape(c[h])).join(','));
  const csv  = [headers.join(','), ...rows].join('\r\n');

  const filename = `counselors_${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

// Get one
router.get('/:id', (req, res) => {
  const counselor = store.getById(req.params.id);
  if (!counselor) return res.status(404).json({ error: 'Counselor not found' });
  res.json(counselor);
});

// Create
router.post('/', validateCounselor(true), (req, res) => {
  const created = store.create(req.body);
  res.status(201).json(created);
});

// Update (partial)
router.patch('/:id', validateCounselor(false), (req, res) => {
  const updated = store.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Counselor not found' });
  res.json(updated);
});

// Delete
router.delete('/:id', (req, res) => {
  const deleted = store.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Counselor not found' });
  res.json({ message: 'Counselor deleted successfully' });
});

module.exports = router;
