import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';

// Most visitors land on Home (ads/SEO/social) — keep it eager so first paint
// has zero Suspense flash. Industries is a secondary nav target, safe to defer.
const Industries = lazy(() => import('./pages/Industries'));

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Suspense fallback={<div style={{ padding: 64, textAlign: 'center', color: '#64748b' }}>Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/industries" element={<Industries />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  );
}
