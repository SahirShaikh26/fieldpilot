const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');

router.use(auth, tenant);

// GET /api/tenant  — current tenant's settings (any authenticated user)
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT name, slug, plan, photo_capture_enabled FROM tenants WHERE id=$1`,
      [req.tenantId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Tenant not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tenant/settings  (Director only)
router.put('/settings', async (req, res) => {
  if (req.user.role !== 'Director') {
    return res.status(403).json({ error: 'Only Directors can change tenant settings' });
  }
  const { photo_capture_enabled } = req.body;

  try {
    const { rows } = await db.query(
      `UPDATE tenants SET photo_capture_enabled=$1 WHERE id=$2 RETURNING name, slug, plan, photo_capture_enabled`,
      [!!photo_capture_enabled, req.tenantId]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
