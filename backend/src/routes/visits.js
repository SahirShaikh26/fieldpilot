const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');

router.use(auth, tenant);

const TARGET_FUTURE_OCCURRENCES = 3;

function addInterval(dateStr, frequency) {
  const d = new Date(dateStr);
  if (frequency === 'weekly') d.setDate(d.getDate() + 7);
  else if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (frequency === 'quarterly') d.setMonth(d.getMonth() + 3);
  return d.toISOString().split('T')[0];
}

// Tops up each active recurring template to TARGET_FUTURE_OCCURRENCES real
// `visits` rows. Idempotent — safe to call on every GET /visits.
async function ensureUpcomingVisits(tenantId) {
  const { rows: templates } = await db.query(
    `SELECT * FROM recurring_visit_templates WHERE tenant_id=$1 AND active=true`,
    [tenantId]
  );

  for (const tpl of templates) {
    const { rows: futureRows } = await db.query(
      `SELECT scheduled_date FROM visits WHERE template_id=$1 AND scheduled_date >= CURRENT_DATE
       ORDER BY scheduled_date DESC LIMIT 1`,
      [tpl.id]
    );
    const { rows: countRows } = await db.query(
      `SELECT COUNT(*) FROM visits WHERE template_id=$1 AND scheduled_date >= CURRENT_DATE`,
      [tpl.id]
    );

    const needed = Math.max(0, TARGET_FUTURE_OCCURRENCES - Number(countRows[0].count));
    if (needed === 0) continue;

    const isFirstEver = futureRows.length === 0;
    let cursorDate = isFirstEver
      ? new Date().toISOString().split('T')[0]
      : futureRows[0].scheduled_date.toISOString().split('T')[0];

    for (let i = 0; i < needed; i++) {
      if (!(isFirstEver && i === 0)) cursorDate = addInterval(cursorDate, tpl.frequency);
      await db.query(
        `INSERT INTO visits (tenant_id, engineer_id, customer_id, machine_id, project_id, scheduled_date, notes, status, created_by, template_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'Scheduled',$8,$9)`,
        [tenantId, tpl.engineer_id, tpl.customer_id, tpl.machine_id, tpl.project_id, cursorDate, tpl.notes, tpl.created_by, tpl.id]
      );
    }
  }
}

// GET /api/visits/recurring  — list templates (Director/Manager only)
router.get('/recurring', async (req, res) => {
  if (!['Director', 'Manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  try {
    const { rows } = await db.query(
      `SELECT rvt.*, c.name AS customer_name, u.name AS engineer_name
       FROM recurring_visit_templates rvt
       LEFT JOIN customers c ON c.id = rvt.customer_id
       LEFT JOIN users     u ON u.id = rvt.engineer_id
       WHERE rvt.tenant_id=$1 ORDER BY rvt.active DESC, rvt.created_at DESC`,
      [req.tenantId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/visits/recurring  (Director/Manager only)
router.post('/recurring', async (req, res) => {
  if (!['Director', 'Manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  const { engineer_id, customer_id, machine_id, project_id, notes, frequency } = req.body;
  if (!engineer_id || !customer_id || !frequency) {
    return res.status(400).json({ error: 'engineer_id, customer_id, and frequency are required' });
  }
  if (!['weekly', 'monthly', 'quarterly'].includes(frequency)) {
    return res.status(400).json({ error: 'frequency must be weekly, monthly, or quarterly' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO recurring_visit_templates
         (tenant_id, engineer_id, customer_id, machine_id, project_id, notes, frequency, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [req.tenantId, engineer_id, customer_id, machine_id || null, project_id || null, notes || null, frequency, req.user.id]
    );
    await ensureUpcomingVisits(req.tenantId);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/visits/recurring/:id  (Director/Manager only)
router.put('/recurring/:id', async (req, res) => {
  if (!['Director', 'Manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  const { engineer_id, customer_id, machine_id, project_id, notes, frequency, active } = req.body;

  try {
    const { rows } = await db.query(
      `UPDATE recurring_visit_templates SET
         engineer_id=COALESCE($1,engineer_id), customer_id=COALESCE($2,customer_id),
         machine_id=COALESCE($3,machine_id), project_id=COALESCE($4,project_id), notes=COALESCE($5,notes),
         frequency=COALESCE($6,frequency), active=COALESCE($7,active)
       WHERE id=$8 AND tenant_id=$9 RETURNING *`,
      [engineer_id, customer_id, machine_id, project_id, notes, frequency, active, req.params.id, req.tenantId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Template not found' });
    if (rows[0].active) await ensureUpcomingVisits(req.tenantId);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/visits
router.get('/', async (req, res) => {
  const { engineer_id, date, status } = req.query;

  try {
    await ensureUpcomingVisits(req.tenantId);
  } catch (err) {
    console.error('ensureUpcomingVisits failed:', err.message);
  }

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
