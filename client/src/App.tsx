import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Studio from './pages/Studio';
import Lipsync from './pages/Lipsync';
import Library from './pages/Library';
import Assets from './pages/Assets';
import Translate from './pages/Translate';

const NAV = [
  { to: '/', label: 'Studio', icon: '✦' },
  { to: '/lipsync', label: 'Lipsync', icon: '◈' },
  { to: '/library', label: 'Library', icon: '▦' },
  { to: '/assets', label: 'Avatars & Voices', icon: '◎' },
  { to: '/translate', label: 'Translate', icon: '⊹' },
];

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <nav style={{
          width: 220,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 0',
          flexShrink: 0,
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
        }}>
          <div style={{ padding: '0 24px 32px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase' }}>HeyGen</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>Studio</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
            {NAV.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--gold)' : 'var(--muted)',
                  background: isActive ? 'rgba(201,162,39,0.08)' : 'transparent',
                  transition: 'all 0.15s',
                })}
              >
                <span style={{ fontSize: 16 }}>{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>
          <div style={{ marginTop: 'auto', padding: '0 24px 8px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>v3 API</div>
          </div>
        </nav>
        <main style={{ marginLeft: 220, flex: 1, padding: '40px 48px', maxWidth: 900 }}>
          <Routes>
            <Route path="/" element={<Studio />} />
            <Route path="/lipsync" element={<Lipsync />} />
            <Route path="/library" element={<Library />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/translate" element={<Translate />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
