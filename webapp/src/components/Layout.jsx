import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/',          label: 'Dashboard',  icon: '📊' },
  { to: '/logs',      label: 'Activity Logs', icon: '📋' },
  { to: '/logs/new',  label: 'Log Activity', icon: '✏️' },
  { to: '/projects',  label: 'Projects',   icon: '🗂️' },
  { to: '/customers', label: 'Customers',  icon: '🏭' },
  { to: '/engineers', label: 'Team',       icon: '👷' },
  { to: '/analytics', label: 'Analytics',  icon: '📈' },
  { to: '/reports',   label: 'Reports',    icon: '📁' },
];

const styles = {
  app:      { display:'flex', minHeight:'100vh' },
  sidebar:  { width:220, background:'#1e3a5f', color:'#fff', display:'flex', flexDirection:'column', padding:'0 0 16px' },
  logo:     { padding:'20px 20px 24px', fontSize:20, fontWeight:700, letterSpacing:1, borderBottom:'1px solid rgba(255,255,255,.15)' },
  nav:      { flex:1, padding:'12px 0' },
  link:     { display:'flex', alignItems:'center', gap:10, padding:'10px 20px', color:'rgba(255,255,255,.75)', textDecoration:'none', fontSize:14 },
  activeLink:{ background:'rgba(255,255,255,.15)', color:'#fff', borderRight:'3px solid #60a5fa' },
  user:     { padding:'12px 20px', borderTop:'1px solid rgba(255,255,255,.15)', fontSize:13, color:'rgba(255,255,255,.7)' },
  main:     { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:   { background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  content:  { flex:1, padding:24, overflowY:'auto' },
  btn:      { padding:'6px 14px', background:'#ef4444', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:13 },
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>⚡ FieldPilot</div>
        <nav style={styles.nav}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.activeLink : {}) })}
            >
              <span>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>
        <div style={styles.user}>
          <div style={{ fontWeight:600, color:'#fff' }}>{user?.name}</div>
          <div>{user?.role}</div>
        </div>
      </aside>
      <div style={styles.main}>
        <div style={styles.topbar}>
          <span style={{ fontWeight:600, color:'#1e3a5f' }}>FieldPilot</span>
          <button style={styles.btn} onClick={handleLogout}>Logout</button>
        </div>
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
