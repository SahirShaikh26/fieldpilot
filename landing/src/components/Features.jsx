const FEATURES = [
  { icon: '📋', title: 'Activity Logging', desc: 'Engineers log site visits, service calls, and hours in seconds — from the web or mobile app.' },
  { icon: '🗂️', title: 'Project Tracking', desc: 'See every project’s status, value, and timeline in one dashboard instead of scattered sheets.' },
  { icon: '🏭', title: 'Customer & Machine Records', desc: 'Keep a full history of customers, sites, and installed machines tied to every job.' },
  { icon: '👷', title: 'Team & Role Management', desc: 'Director, Manager, and Engineer roles with the right permissions for each, out of the box.' },
  { icon: '📈', title: 'Analytics & Reports', desc: 'Monthly billing trends, engineer performance, and exportable reports without spreadsheet work.' },
  { icon: '📱', title: 'Mobile App for Engineers', desc: 'A lightweight Android/iOS app for field engineers to check in, log activity, and import data on the go.' },
];

export default function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">FEATURES</span>
          <h2>Everything your field team needs, in one place</h2>
          <p>Replace scattered spreadsheets and WhatsApp updates with a single source of truth.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
