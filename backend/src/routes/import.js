const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');

router.use(auth);
router.use(tenant);

// POST /api/import/customers
// CSV columns: name, code, city, region, contact_name, contact_phone, address
router.post('/customers', async (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records) || !records.length)
    return res.status(400).json({ error: 'No records provided' });

  let inserted = 0, skipped = 0;
  for (const r of records) {
    if (!r.name) { skipped++; continue; }
    try {
      await db.query(
        `INSERT INTO customers (tenant_id, code, name, city, region, contact_name, contact_phone, address)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT DO NOTHING`,
        [req.tenantId, r.code || '', r.name, r.city || null, r.region || null,
         r.contact_name || null, r.contact_phone || null, r.address || null]
      );
      inserted++;
    } catch { skipped++; }
  }
  res.json({ message: `Imported ${inserted} customers, skipped ${skipped}` });
});

// POST /api/import/engineers  (Director/Manager only)
// CSV columns: name, email, password, dept, role
router.post('/engineers', async (req, res) => {
  if (!['Director', 'Manager'].includes(req.user.role))
    return res.status(403).json({ error: 'Insufficient permissions' });

  const { records } = req.body;
  if (!Array.isArray(records) || !records.length)
    return res.status(400).json({ error: 'No records provided' });

  let inserted = 0, skipped = 0;
  for (const r of records) {
    if (!r.name || !r.email || !r.password) { skipped++; continue; }
    const role = ['Director', 'Manager', 'Engineer'].includes(r.role) ? r.role : 'Engineer';
    try {
      const hash = await bcrypt.hash(r.password, 12);
      await db.query(
        `INSERT INTO users (tenant_id, name, email, password_hash, role, dept)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (email) DO NOTHING`,
        [req.tenantId, r.name, r.email.toLowerCase(), hash, role, r.dept || null]
      );
      inserted++;
    } catch { skipped++; }
  }
  res.json({ message: `Imported ${inserted} engineers, skipped ${skipped}` });
});

// POST /api/import/projects
// CSV columns: name, customer_name, status, category, start_date, end_date, value_inr
router.post('/projects', async (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records) || !records.length)
    return res.status(400).json({ error: 'No records provided' });

  let inserted = 0, skipped = 0;
  for (const r of records) {
    if (!r.name) { skipped++; continue; }
    try {
      let customerId = null;
      if (r.customer_name) {
        const { rows } = await db.query(
          `SELECT id FROM customers WHERE tenant_id=$1 AND LOWER(name)=LOWER($2) LIMIT 1`,
          [req.tenantId, r.customer_name]
        );
        customerId = rows[0]?.id || null;
      }
      const validStatuses = ['Planned','Active','On Hold','Completed','Cancelled'];
      const status = validStatuses.includes(r.status) ? r.status : 'Planned';
      await db.query(
        `INSERT INTO projects (tenant_id, name, customer_id, status, category, start_date, end_date, value_inr)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [req.tenantId, r.name, customerId, status, r.category || null,
         r.start_date || null, r.end_date || null,
         r.value_inr ? parseFloat(r.value_inr) : null]
      );
      inserted++;
    } catch { skipped++; }
  }
  res.json({ message: `Imported ${inserted} projects, skipped ${skipped}` });
});

// POST /api/import/machines
// CSV columns: name, model, product_type, serial_no, customer_name, install_year, warranty_until
router.post('/machines', async (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records) || !records.length)
    return res.status(400).json({ error: 'No records provided' });

  let inserted = 0, skipped = 0;
  for (const r of records) {
    if (!r.name || !r.customer_name) { skipped++; continue; }
    try {
      const { rows } = await db.query(
        `SELECT id FROM customers WHERE tenant_id=$1 AND LOWER(name)=LOWER($2) LIMIT 1`,
        [req.tenantId, r.customer_name]
      );
      if (!rows[0]) { skipped++; continue; }
      await db.query(
        `INSERT INTO machines (customer_id, name, model, product_type, serial_no, install_year, warranty_until)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [rows[0].id, r.name, r.model || null, r.product_type || null,
         r.serial_no || null, r.install_year ? parseInt(r.install_year) : null,
         r.warranty_until || null]
      );
      inserted++;
    } catch { skipped++; }
  }
  res.json({ message: `Imported ${inserted} machines, skipped ${skipped}` });
});

module.exports = router;
