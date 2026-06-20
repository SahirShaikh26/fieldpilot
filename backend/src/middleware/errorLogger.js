const db = require('../db');
const Sentry = require('../sentry');

// Replaces the bare 500-handler — logs to error_events and Sentry (if configured)
// before returning the same generic response.
module.exports = async (err, req, res, next) => {
  console.error(err.stack);
  if (Sentry) Sentry.captureException(err);

  try {
    await db.query(
      `INSERT INTO error_events (tenant_id, route, method, status_code, message, stack)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [req.user?.tenant_id || null, req.originalUrl, req.method, 500, err.message, err.stack]
    );
  } catch (logErr) {
    console.error('Failed to log error event:', logErr.message);
  }

  res.status(500).json({ error: 'Internal server error' });
};
