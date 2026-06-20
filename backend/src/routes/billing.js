const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const tenant = require('../middleware/tenant');
const razorpay = require('../razorpay');
const PLANS = require('../config/plans');

// Number of monthly billing cycles to request — Razorpay subscriptions require
// a total_count; there's no "indefinite" option, so we use a large figure
// (~100 years) and let the customer cancel whenever they want.
const INDEFINITE_CYCLES = 1200;

router.use(auth, tenant);

// GET /api/billing/subscription
router.get('/subscription', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT plan, plan_status, trial_ends_at FROM tenants WHERE id=$1`,
      [req.tenantId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Tenant not found' });

    const { rows: [{ count }] } = await db.query(
      `SELECT COUNT(*) FROM users WHERE tenant_id=$1 AND active=true`,
      [req.tenantId]
    );

    const tenantRow = rows[0];
    const planCfg = PLANS[tenantRow.plan] || PLANS.starter;

    res.json({
      plan: tenantRow.plan,
      plan_status: tenantRow.plan_status,
      trial_ends_at: tenantRow.trial_ends_at,
      seats_used: Number(count),
      seat_cap: planCfg.seatCap === Infinity ? null : planCfg.seatCap,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/billing/checkout  { tier: 'starter' | 'pro' }  (Director only)
// Creates a Razorpay subscription and returns its hosted short_url — the
// customer pays there (supports UPI Autopay, cards, netbanking).
router.post('/checkout', async (req, res) => {
  if (req.user.role !== 'Director') {
    return res.status(403).json({ error: 'Only Directors can manage billing' });
  }
  if (!razorpay) return res.status(503).json({ error: 'Billing is not configured' });

  const { tier } = req.body;
  const planCfg = PLANS[tier];
  if (!planCfg || !planCfg.planId) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planCfg.planId,
      total_count: INDEFINITE_CYCLES,
      customer_notify: 1,
      notes: { tenant_id: req.tenantId, tier },
    });

    await db.query(`UPDATE tenants SET razorpay_subscription_id=$1 WHERE id=$2`, [subscription.id, req.tenantId]);

    res.json({ url: subscription.short_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not start checkout' });
  }
});

// POST /api/billing/cancel  (Director only)
// Razorpay has no hosted "manage billing" portal like Stripe's, so cancellation
// is a direct API call instead.
router.post('/cancel', async (req, res) => {
  if (req.user.role !== 'Director') {
    return res.status(403).json({ error: 'Only Directors can manage billing' });
  }
  if (!razorpay) return res.status(503).json({ error: 'Billing is not configured' });

  try {
    const { rows } = await db.query(`SELECT razorpay_subscription_id FROM tenants WHERE id=$1`, [req.tenantId]);
    const subId = rows[0]?.razorpay_subscription_id;
    if (!subId) return res.status(400).json({ error: 'No active subscription to cancel' });

    await razorpay.subscriptions.cancel(subId);
    res.json({ message: 'Subscription will be cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not cancel subscription' });
  }
});

module.exports = router;
