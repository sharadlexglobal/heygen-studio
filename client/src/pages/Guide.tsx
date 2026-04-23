import { useState } from 'react';

const PRICING = [
  { service: 'Lipsync', mode: 'Speed', rps: 3.20 },
  { service: 'Lipsync', mode: 'Precision', rps: 6.40 },
  { service: 'Avatar IV', mode: '720p', rps: 4.80 },
  { service: 'Avatar IV', mode: '4K', rps: 8.00 },
  { service: 'Video Agent', mode: '—', rps: 3.20 },
  { service: 'Translation', mode: 'Lipsync Speed', rps: 3.20 },
  { service: 'Translation', mode: 'Lipsync Precision', rps: 6.40 },
];

const SECTIONS = [
  {
    num: '01', color: '#5b8cff',
    title: 'Lipsync — MP3 se avatar video banana',
    desc: 'Sabse common use case. Apni MP3 do, kisi bhi video pe Sharad Sir ki lip-sync lagao.',
    steps: [
      'Sidebar mein "Lipsync" pe click karo',
      'MP3 file upload karo (max 32 MB, sirf .mp3 format)',
      'Source Video URL paste karo — jis video pe lip-sync lagani hai',
      'Quality: Speed (₹3.20/sec) ya Precision (₹6.40/sec) choose karo',
      '"Create Lipsync Video" dabao',
      '1–3 minute wait karo — browser band mat karo',
      '"Watch Video" ya "Download MP4" se final video lo',
    ],
  },
  {
    num: '02', color: '#c9a227',
    title: 'Studio — Prompt se nayi video banana',
    desc: 'Text likhne se AI khud sab kuch decide karta hai — avatar, script, scene.',
    steps: [
      'Sidebar mein "Studio" pe click karo',
      'Prompt mein clearly likho: topic, tone, duration',
      'Avatar ID mein Sharad 2025 ka ID paste karo (neeche diya hai)',
      'Quality aur Orientation choose karo',
      'Optionally MP3 attach karo — AI isko context ki tarah use karega',
      '"Create Video" dabao aur wait karo (2–5 min)',
    ],
  },
  {
    num: '03', color: '#4caf7d',
    title: 'Library — Saare videos manage karna',
    desc: 'Pehle bane sab videos yahan milenge — status, download, delete.',
    steps: [
      '"Library" pe click karo',
      'Processing videos ke paas "↺" se status refresh karo',
      'Completed video pe "Watch" ya "↓" download button use karo',
      '"✕" se video delete karo jab zarurat na ho',
    ],
  },
  {
    num: '04', color: '#a855f7',
    title: 'Translate — Video ko doosri bhasha mein',
    desc: '30+ languages mein video translate karo — Hindi, Tamil, Telugu, Spanish sab available hain.',
    steps: [
      '"Translate" pe click karo',
      'Source video URL ya Asset ID do',
      'Target language(s) select karo',
      'Mode choose karo: Speed (fast) ya Precision (best lipsync)',
      '"Translate Video" dabao — 2–5 min lagenge',
    ],
  },
  {
    num: '05', color: '#e05555',
    title: 'Avatars & Voices — IDs copy karna',
    desc: 'Studio ya Lipsync mein specific avatar/voice use karna ho to yahan se ID copy karo.',
    steps: [
      '"Avatars & Voices" pe click karo',
      'Avatar card pe click karo — look_id clipboard mein copy ho jaegi',
      'Voices tab mein language/gender filter lagao',
      'Voice card pe click karo — voice_id copy ho jaegi',
      'Copied ID ko Studio ke field mein paste karo',
    ],
  },
];

function CostCalculator() {
  const [mins, setMins] = useState(1);
  const [secs, setSecs] = useState(0);
  const total = mins * 60 + secs;

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionHeading>COST CALCULATOR</SectionHeading>
      <div className="card">
        <label>Video ki expected duration</label>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '10px 0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="number" min={0} max={60} value={mins}
              onChange={e => setMins(Math.max(0, +e.target.value || 0))}
              style={{ width: 72 }} />
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>min</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="number" min={0} max={59} value={secs}
              onChange={e => setSecs(Math.min(59, Math.max(0, +e.target.value || 0)))}
              style={{ width: 72 }} />
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>sec</span>
          </div>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>= {total} seconds</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Lipsync — Speed', rps: 3.20, color: '#5b8cff' },
            { label: 'Lipsync — Precision', rps: 6.40, color: '#a855f7' },
            { label: 'Avatar IV — 720p', rps: 4.80, color: '#c9a227' },
            { label: 'Avatar IV — 4K', rps: 8.00, color: '#e05555' },
          ].map(c => (
            <div key={c.label} style={{
              padding: '14px 16px', borderRadius: 10,
              background: c.color + '11', border: `1px solid ${c.color}33`,
            }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: c.color }}>
                ₹{(c.rps * total).toFixed(0)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>₹{c.rps}/sec</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase',
      letterSpacing: 2, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      {children}
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

export default function Guide() {
  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Team Guide</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          HeyGen Studio — Sharad Bansal ke team ke liye usage manual
        </p>
      </div>

      {/* PRICING TABLE */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeading>PRICING — 1 USD = ₹96</SectionHeading>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Service', 'Mode / Quality', '30 sec', '1 min', '2 min', '5 min'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)',
                    fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRICING.map((r, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '11px 16px', fontWeight: 600 }}>{r.service}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--muted)' }}>{r.mode}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--gold)', fontWeight: 700 }}>₹{(r.rps * 30).toFixed(0)}</td>
                  <td style={{ padding: '11px 16px' }}>₹{(r.rps * 60).toFixed(0)}</td>
                  <td style={{ padding: '11px 16px' }}>₹{(r.rps * 120).toFixed(0)}</td>
                  <td style={{ padding: '11px 16px' }}>₹{(r.rps * 300).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          * Cost output video ki duration pe lagti hai — audio ki length nahi
        </p>
      </section>

      {/* STEP BY STEP */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeading>STEP-BY-STEP INSTRUCTIONS</SectionHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SECTIONS.map(s => (
            <div key={s.num} className="card">
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                  background: s.color + '18', border: `1px solid ${s.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: s.color,
                }}>{s.num}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>{s.desc}</p>
                  <ol style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {s.steps.map((step, i) => (
                      <li key={i} style={{ fontSize: 13, lineHeight: 1.6 }}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* KEY IDs */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeading>IMPORTANT IDs</SectionHeading>
        <div className="card">
          {[
            { label: 'Sharad 2025 — Avatar ID (latest)', value: '016ed92e82954f92871f6b647f65f12d', note: 'Yahi use karo — March 2025 ka avatar', color: '#c9a227' },
            { label: 'Sharad Bansal — Avatar ID', value: '28d4933eed004437bfcf4028709c23f0', note: 'Nov 2024 ka purana avatar', color: 'var(--muted)' },
            { label: 'Sharad 2025 — Default Voice ID', value: '963bbbe2f55b44c68fa867eaf9268d8f', note: 'Jab custom MP3 na ho tab yeh voice use hogi', color: 'var(--muted)' },
          ].map(({ label, value, note, color }, i, arr) => (
            <div key={value} style={{ marginBottom: i < arr.length - 1 ? 16 : 0, paddingBottom: i < arr.length - 1 ? 16 : 0, borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
              <code style={{ fontSize: 12, color, display: 'block', marginBottom: 4, wordBreak: 'break-all' }}>{value}</code>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DOS AND DONTS */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeading>DHYAN RAKHNA</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card" style={{ borderColor: 'rgba(76,175,125,0.3)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', marginBottom: 12 }}>✓ KARO</div>
            {[
              'MP3 file 32 MB se choti rakho',
              'Lipsync ke liye clear awaaz wali MP3 do',
              '720p se shuru karo — zarurat pe 4K karo',
              'Library mein status check karo',
              'Ek baar mein ek hi badi video banao',
            ].map((t, i) => (
              <div key={i} style={{ fontSize: 13, marginBottom: 8, paddingLeft: 10,
                borderLeft: '2px solid rgba(76,175,125,0.5)', lineHeight: 1.5 }}>{t}</div>
            ))}
          </div>
          <div className="card" style={{ borderColor: 'rgba(224,85,85,0.3)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', marginBottom: 12 }}>✗ MAT KARO</div>
            {[
              'Browser band mat karo jab tak video ready na ho',
              'Ek saath multiple badi videos submit mat karo',
              'WAV/AAC format mat dena — sirf MP3',
              'Page refresh mat karo processing ke beech mein',
              '4K sirf tab use karo jab zaruri ho',
            ].map((t, i) => (
              <div key={i} style={{ fontSize: 13, marginBottom: 8, paddingLeft: 10,
                borderLeft: '2px solid rgba(224,85,85,0.5)', lineHeight: 1.5 }}>{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* COST CALCULATOR */}
      <CostCalculator />
    </div>
  );
}
