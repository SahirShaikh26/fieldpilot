const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');

router.use(auth, tenant);

// GET /api/reports/summary  — overall KPIs
router.get('/summary', async (req, res) => {
  const { date_from, date_to, engineer_id } = req.query;

  const conditions = ['tenant_id = $1'];
  const params = [req.tenantId];
  let i = 2;
  if (date_from)   { conditions.push(`date >= $${i++}`);        params.push(date_from); }
  if (date_to)     { conditions.push(`date <= $${i++}`);        params.push(date_to); }
  if (engineer_id) { conditions.push(`engineer_id = $${i++}`);  params.push(engineer_id); }

  const where = conditions.join(' AND ');

  try {
    const totals = await db.query(
      `SELECT
         COUNT(*)                        AS total_logs,
         SUM(hours)                      AS total_hours,
         SUM(billing_inr)                AS total_billing,
         SUM(cost_inr)                   AS total_cost,
         COUNT(DISTINCT engineer_id)     AS active_engineers,
         COUNT(DISTINCT customer_id)     AS customers_served
       FROM activity_logs WHERE ${where}`,
      params
    );

    const byActivity = await db.query(
      `SELECT activity_code, COUNT(*) AS count, SUM(hours) AS hours, SUM(billing_inr) AS billing
       FROM activity_logs WHERE ${where}
       GROUP BY activity_code ORDER BY count DESC`,
      params
    );

    const byEngineer = await db.query(
      `SELECT u.name, l.engineer_id,
              COUNT(*)::int AS logs,
              SUM(l.hours) AS hours,
              SUM(l.billing_inr) AS billing
       FROM activity_logs l
       JOIN users u ON u.id = l.engineer_id
       WHERE ${where}
       GROUP BY l.engineer_id, u.name
       ORDER BY billing DESC`,
      params
    );

    const byMonth = await db.query(
      `SELECT TO_CHAR(date,'YYYY-MM') AS month,
              COUNT(*)::int AS logs,
              SUM(hours) AS hours,
              SUM(billing_inr) AS billing
       FROM activity_logs WHERE ${where}
       GROUP BY month ORDER BY month`,
      params
    );

    res.json({
      totals: totals.rows[0],
      by_activity: byActivity.rows,
      by_engineer: byEngineer.rows,
      by_month: byMonth.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/export/csv
router.get('/export/csv', async (req, res) => {
  if (!['Director', 'Manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const { date_from, date_to, engineer_id } = req.query;
  const conditions = ['l.tenant_id = $1'];
  const params = [req.tenantId];
  let i = 2;
  if (date_from)   { conditions.push(`l.date >= $${i++}`);       params.push(date_from); }
  if (date_to)     { conditions.push(`l.date <= $${i++}`);       params.push(date_to); }
  if (engineer_id) { conditions.push(`l.engineer_id = $${i++}`); params.push(engineer_id); }

  try {
    const { rows } = await db.query(
      `SELECT l.date, u.name AS engineer, c.name AS customer,
              l.activity_code, l.query_type, l.product_type,
              l.hours, l.billing_inr, l.cost_inr, l.status,
              l.location, l.notes, p.name AS project
       FROM activity_logs l
       LEFT JOIN users     u ON u.id = l.engineer_id
       LEFT JOIN customers c ON c.id = l.customer_id
       LEFT JOIN projects  p ON p.id = l.project_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY l.date DESC`,
      params
    );

    const headers = Object.keys(rows[0] || {
      date:'',engineer:'',customer:'',activity_code:'',query_type:'',
      product_type:'',hours:'',billing_inr:'',cost_inr:'',status:'',
      location:'',notes:'',project:'',
    });

    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => escape(r[h])).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="fieldpilot-logs-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/attendance
router.get('/attendance', async (req, res) => {
  const { month, engineer_id } = req.query;

  const conditions = ['u.tenant_id = $1'];
  const params = [req.tenantId];
  let i = 2;
  if (month)       { conditions.push(`TO_CHAR(a.date,'YYYY-MM') = $${i++}`); params.push(month); }
  if (engineer_id) { conditions.push(`a.engineer_id = $${i++}`);             params.push(engineer_id); }

  try {
    const { rows } = await db.query(
      `SELECT a.*, u.name AS engineer_name
       FROM attendance a
       JOIN users u ON u.id = a.engineer_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.date DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
