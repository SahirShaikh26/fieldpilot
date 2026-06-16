import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const s = {
  page:  { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f4ff' },
  card:  { background:'#fff', borderRadius:12, padding:40, width:380, boxShadow:'0 4px 24px rgba(0,0,0,.1)' },
  logo:  { textAlign:'center', fontSize:28, fontWeight:800, color:'#1e3a5f', marginBottom:8 },
  sub:   { textAlign:'center', color:'#64748b', fontSize:14, marginBottom:32 },
  label: { display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:6 },
  input: { width:'100%', padding:'10px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:14, outline:'none', marginBottom:16 },
  btn:   { width:'100%', padding:12, background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer' },
  err:   { color:'#ef4444', fontSize:13, marginBottom:12 },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>⚡ FieldPilot</div>
        <div style={s.sub}>Field Service Management</div>
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@company.com" />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" />
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
