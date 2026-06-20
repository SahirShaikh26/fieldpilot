const STEPS = [
  { n: 1, title: 'Register your company', desc: 'Create your account in under a minute and invite your managers and engineers.' },
  { n: 2, title: 'Log work in the field', desc: 'Your team logs activity, projects, and check-ins from web or mobile as work happens.' },
  { n: 3, title: 'See it all in one dashboard', desc: 'Track billing, performance, and project status in real time — no more chasing updates.' },
];

export default function HowItWorks() {
  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">HOW IT WORKS</span>
          <h2>Up and running in three steps</h2>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
