import { LOGIN_URL, SIGNUP_URL } from '../config';

export default function Nav() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="logo">⚡ FieldPilot</div>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="nav-actions">
          <a href={LOGIN_URL} className="btn btn-ghost">Log In</a>
          <a href={SIGNUP_URL} className="btn btn-primary">Start Free Trial</a>
        </div>
      </div>
    </header>
  );
}
