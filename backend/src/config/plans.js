// Single source of truth for seat caps + Razorpay plan IDs per tier.
const PLANS = {
  starter: { label: 'Starter', seatCap: 5, planId: process.env.RAZORPAY_PLAN_STARTER || null },
  pro: { label: 'Pro', seatCap: 25, planId: process.env.RAZORPAY_PLAN_PRO || null },
  enterprise: { label: 'Enterprise', seatCap: Infinity, planId: null },
};

module.exports = PLANS;
