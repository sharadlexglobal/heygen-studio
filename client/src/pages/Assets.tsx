import { useState, useEffect } from 'react';

interface Avatar {
  group_id: string;
  name: string;
  gender?: string;
  preview_url?: string;
  preview_image_url?: string;
  looks?: { look_id: string; name?: string }[];
}

interface Voice {
  voice_id: string;
  name: string;
  language?: string;
  gender?: string;
  preview_url?: string;
}

export default function Assets() {
  const [tab, setTab] = useState<'avatars' | 'voices'>('avatars');
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voiceLang, setVoiceLang] = useState('');
  const [voiceGender, setVoiceGender] = useState('');
  const [copied, setCopied] = useState('');

  async function loadAvatars() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/avatars?limit=50');
      const data = await res.json();
      setAvatars(data.data?.avatars || data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadVoices() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (voiceLang) params.set('language', voiceLang);
      if (voiceGender) params.set('gender', voiceGender);
      const res = await fetch(`/api/voices?${params}`);
      const data = await res.json();
      setVoices(data.data?.voices || data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tab === 'avatars') loadAvatars();
    else loadVoices();
  }, [tab]);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Avatars & Voices</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Browse IDs to use in Studio — click to copy</p>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {(['avatars', 'voices'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 24px', borderRadius: 8, fontSize: 14, fontWeight: 500,
            background: tab === t ? 'var(--gold)' : 'transparent',
            color: tab === t ? '#000' : 'var(--muted)',
          }}>
            {t === 'avatars' ? 'Avatars' : 'Voices'}
          </button>
        ))}
      </div>

      {tab === 'voices' && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <input value={voiceLang} onChange={e => setVoiceLang(e.target.value)} placeholder="Language (e.g. English, Hindi)" style={{ flex: 1 }} />
          <select value={voiceGender} onChange={e => setVoiceGender(e.target.value)} style={{ flex: 1 }}>
            <option value="">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <button className="btn-gold" onClick={loadVoices} disabled={loading} style={{ flexShrink: 0 }}>Filter</button>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      )}

      {tab === 'avatars' && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {avatars.map(av => (
            <div key={av.group_id} className="card" style={{ cursor: 'pointer' }} onClick={() => copy(av.looks?.[0]?.look_id || av.group_id)}>
              {av.preview_image_url || av.preview_url ? (
                <img src={av.preview_image_url || av.preview_url} alt={av.name} style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
              ) : (
                <div style={{ width: '100%', aspectRatio: '9/16', background: 'var(--border)', borderRadius: 8, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>◎</div>
              )}
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{av.name}</div>
              {av.gender && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>{av.gender}</div>}
              <code style={{ fontSize: 10, color: copied === (av.looks?.[0]?.look_id || av.group_id) ? 'var(--success)' : 'var(--muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {copied === (av.looks?.[0]?.look_id || av.group_id) ? '✓ Copied!' : (av.looks?.[0]?.look_id || av.group_id)}
              </code>
            </div>
          ))}
        </div>
      )}

      {tab === 'voices' && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {voices.map(v => (
            <div key={v.voice_id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }} onClick={() => copy(v.voice_id)}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{v.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {[v.language, v.gender].filter(Boolean).join(' · ')}
                </div>
              </div>
              <code style={{ fontSize: 11, color: copied === v.voice_id ? 'var(--success)' : 'var(--muted)' }}>
                {copied === v.voice_id ? '✓ Copied!' : v.voice_id}
              </code>
              {v.preview_url && (
                <audio controls src={v.preview_url} style={{ height: 28 }} onClick={e => e.stopPropagation()} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
