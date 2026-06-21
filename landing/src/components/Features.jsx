const FEATURES = [
  { icon: '🗓️', title: 'Job Scheduling & Dispatch', desc: 'Assign engineers to future visits, not just review what already happened. They see today\'s jobs the moment they open the app.' },
  { icon: '📡', title: 'Works Offline', desc: 'Engineers keep logging activity and checking in with no signal — everything syncs automatically the moment they\'re back online.' },
  { icon: '📸', title: 'Photo Proof of Work', desc: 'Attach before/after photos to any job — proof of work, billing protection, and customer trust, optional per company.' },
  { icon: '🎤', title: 'Voice Notes, Any Language', desc: 'Engineers dictate activity notes in Hindi, Marathi, Tamil, Telugu, Kannada, Bengali, Gujarati, Punjabi, or Malayalam.' },
  { icon: '📋', title: 'Activity Logging', desc: 'Engineers log site visits, service calls, and hours in seconds — from the web or mobile app.' },
  { icon: '🏭', title: 'Customer & Machine Records', desc: 'Keep a full history of customers, sites, and installed machines — with automatic warranty expiry reminders.' },
  { icon: '👷', title: 'Team & Role Management', desc: 'Director, Manager, and Engineer roles with the right permissions for each, out of the box.' },
  { icon: '📈', title: 'Analytics & Reports', desc: 'Monthly billing trends, engineer performance, and exportable reports without spreadsheet work.' },
  { icon: '📱', title: 'Mobile App for Engineers', desc: 'A lightweight Android app built for the field — fast to load, easy to use, works on basic Android devices.' },
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
