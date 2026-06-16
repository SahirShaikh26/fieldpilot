// Attaches tenant_id from JWT to every request and enforces isolation
module.exports = (req, res, next) => {
  if (!req.user || !req.user.tenant_id) {
    return res.status(403).json({ error: 'Tenant context missing' });
  }
  req.tenantId = req.user.tenant_id;
  next();
};
