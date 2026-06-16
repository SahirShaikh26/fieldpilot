const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const { rows } = await db.query(
      `SELECT u.*, t.slug AS tenant_slug FROM users u
       JOIN tenants t ON t.id = u.tenant_id
       WHERE u.email = $1 AND u.active = true`,
      [email]
    );

    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, tenant_id: user.tenant_id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, dept: user.dept },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/register-tenant  (onboarding new company)
router.post('/register-tenant', async (req, res) => {
  const { company_name, slug, admin_name, admin_email, password } = req.body;
  if (!company_name || !slug || !admin_name || !admin_email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const hash = await bcrypt.hash(password, 12);

    await db.query('BEGIN');
    const { rows: [tenant] } = await db.query(
      `INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING id`,
      [company_name, slug]
    );
    await db.query(
      `INSERT INTO users (tenant_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'Director')`,
      [tenant.id, admin_name, admin_email, hash]
    );
    await db.query('COMMIT');

    res.status(201).json({ message: 'Tenant created successfully' });
  } catch (err) {
    await db.query('ROLLBACK').catch(() => {});
    if (err.code === '23505') return res.status(409).json({ error: 'Email or slug already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/change-password
const authMiddleware = require('../middleware/auth');
router.post('/change-password', authMiddleware, async (req, res) => {
  const { current_password, new_password } = req.body;
  try {
    const { rows } = await db.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password incorrect' });

    const hash = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
