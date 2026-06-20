import { SIGNUP_URL } from '../config';

export default function CtaBanner() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="cta-banner">
        <h2>Ready to get your field team out of spreadsheets?</h2>
        <p>Start your free 14-day trial today — no credit card required.</p>
        <a href={SIGNUP_URL} className="btn btn-primary btn-lg">Start Free Trial</a>
      </div>
    </section>
  );
}
