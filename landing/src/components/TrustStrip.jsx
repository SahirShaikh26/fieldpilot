const ITEMS = [
  '14-day free trial',
  'No credit card required',
  'UPI, card & netbanking supported',
  'Web, mobile & PWA',
];

export default function TrustStrip() {
  return (
    <div className="trust-strip">
      <div className="container">
        {ITEMS.map((item) => (
          <span key={item}>✓ {item}</span>
        ))}
      </div>
    </div>
  );
}
