const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');

router.use(auth, tenant);

// GET /api/visits
router.get('/', async (req, res) => {
  const { engineer_id, date, status } = req.query;
  const conditions = ['v.tenant_id = $1'];
  const params = [req.tenantId];
  let i = 2;

  if (engineer_id) { conditions.push(`v.engineer_id = $${i++}`); params.push(engineer_id); }
  if (date)        { conditions.push(`v.scheduled_date = $${i++}`); params.push(date === 'today' ? new Date().toISOString().split('T')[0] : date); }
  if (status)      { conditions.push(`v.status = $${i++}`); params.push(status); }

  if (req.user.role === 'Engineer') {
    conditions.push(`v.engineer_id = $${i++}`);
    params.push(req.user.id);
  }

  try {
    const { rows } = await db.query(
      `SELECT v.*,
              c.name AS customer_name,
              m.name AS machine_name,
              u.name AS engineer_name
       FROM visits v
       LEFT JOIN customers c ON c.id = v.customer_id
       LEFT JOIN machines  m ON m.id = v.machine_id
       LEFT JOIN users     u ON u.id = v.engineer_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY v.scheduled_date ASC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/visits/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT v.*, c.name AS customer_name, m.name AS machine_name, u.name AS engineer_name
       FROM visits v
       LEFT JOIN customers c ON c.id = v.customer_id
       LEFT JOIN machines  m ON m.id = v.machine_id
       LEFT JOIN users     u ON u.id = v.engineer_id
       WHERE v.id = $1 AND v.tenant_id = $2`,
      [req.params.id, req.tenantId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Visit not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/visits  (Director/Manager only)
router.post('/', async (req, res) => {
  if (!['Director', 'Manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  const { engineer_id, customer_id, machine_id, project_id, scheduled_date, notes } = req.body;
  if (!engineer_id || !customer_id || !scheduled_date) {
    return res.status(400).json({ error: 'engineer_id, customer_id, and scheduled_date are required' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO visits
         (tenant_id, engineer_id, customer_id, machine_id, project_id, scheduled_date, notes, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Scheduled',$8)
       RETURNING *`,
      [req.tenantId, engineer_id, customer_id, machine_id || null, project_id || null, scheduled_date, notes || null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/visits/:id  (Director/Manager only)
router.put('/:id', async (req, res) => {
  if (!['Director', 'Manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  const { engineer_id, customer_id, machine_id, project_id, scheduled_date, notes, status } = req.body;

  try {
    const { rows } = await db.query(
      `UPDATE visits SET
         engineer_id=$1, customer_id=$2, machine_id=$3, project_id=$4,
         scheduled_date=$5, notes=$6, status=$7
       WHERE id=$8 AND tenant_id=$9
       RETURNING *`,
      [engineer_id, customer_id, machine_id, project_id, scheduled_date, notes, status, req.params.id, req.tenantId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Visit not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
