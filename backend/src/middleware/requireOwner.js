// Platform-owner gate — distinct from per-tenant 'Director' role since this
// spans data across ALL tenants and must not be reachable by customer accounts.
const OWNER_EMAILS = (process.env.OWNER_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

module.exports = (req, res, next) => {
  if (!req.user?.email || !OWNER_EMAILS.includes(req.user.email.toLowerCase())) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
