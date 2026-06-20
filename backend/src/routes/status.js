const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const requireOwner = require('../middleware/requireOwner');

router.use(auth, requireOwner);

// GET /api/status/summary — platform-wide error overview (owner-only)
router.get('/summary', async (req, res) => {
  try {
    const [last24h, last7d, byRoute, recent] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM error_events WHERE created_at > NOW() - INTERVAL '24 hours'`),
      db.query(`SELECT COUNT(*) FROM error_events WHERE created_at > NOW() - INTERVAL '7 days'`),
      db.query(
        `SELECT route, method, COUNT(*) AS count, MAX(created_at) AS last_seen
         FROM error_events WHERE created_at > NOW() - INTERVAL '7 days'
         GROUP BY route, method ORDER BY count DESC LIMIT 20`
      ),
      db.query(
        `SELECT id, tenant_id, route, method, status_code, message, created_at
         FROM error_events ORDER BY created_at DESC LIMIT 50`
      ),
    ]);

    res.json({
      count_24h: Number(last24h.rows[0].count),
      count_7d: Number(last7d.rows[0].count),
      by_route: byRoute.rows,
      recent: recent.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
