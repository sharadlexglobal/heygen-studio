import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Studio from './pages/Studio';
import Lipsync from './pages/Lipsync';
import Library from './pages/Library';
import Assets from './pages/Assets';
import Translate from './pages/Translate';
import Guide from './pages/Guide';

const NAV = [
  { to: '/',         label: 'Studio',           icon: '✦' },
  { to: '/lipsync',  label: 'Lipsync',          icon: '◈' },
  { to: '/library',  label: 'Library',          icon: '▦' },
  { to: '/assets',   label: 'Avatars & Voices', icon: '◎' },
  { to: '/translate',label: 'Translate',        icon: '⊹' },
  { to: '/guide',    label: 'Team Guide',       icon: '?' },
];

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <nav style={{
          width: 220, background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          padding: '32px 0', flexShrink: 0,
          position: 'fixed', top: 0, left: 0, bottom: 0,
        }}>
          <div style={{ padding: '0 24px 32px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase' }}>HeyGen</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>Studio</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px', flex: 1 }}>
            {NAV.map(({ to, label, icon }) => (
              <NavLink key={to} to={to} end={to === '/'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8,
                  textDecoration: 'none', fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: to === '/guide'
                    ? (isActive ? '#a855f7' : '#7060a0')
                    : isActive ? 'var(--gold)' : 'var(--muted)',
                  background: to === '/guide'
                    ? (isActive ? 'rgba(168,85,247,0.1)' : 'transparent')
                    : isActive ? 'rgba(201,162,39,0.08)' : 'transparent',
                  transition: 'all 0.15s',
                  marginTop: to === '/guide' ? 8 : 0,
                  borderTop: to === '/guide' ? '1px solid var(--border)' : 'none',
                  paddingTop: to === '/guide' ? 18 : 10,
                })}
              >
                <span style={{ fontSize: 15 }}>{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>

          <div style={{ padding: '16px 24px 0' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>HeyGen v3 API</div>
            <div style={{ fontSize: 10, color: 'var(--border)', marginTop: 2 }}>Sharad Bansal</div>
          </div>
        </nav>

        <main style={{ marginLeft: 220, flex: 1, padding: '40px 48px', maxWidth: 920 }}>
          <Routes>
            <Route path="/"          element={<Studio />} />
            <Route path="/lipsync"   element={<Lipsync />} />
            <Route path="/library"   element={<Library />} />
            <Route path="/assets"    element={<Assets />} />
            <Route path="/translate" element={<Translate />} />
            <Route path="/guide"     element={<Guide />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
