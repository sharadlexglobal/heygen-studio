import { useState } from 'react';

const SHARAD_2025_ID = '016ed92e82954f92871f6b647f65f12d';
const SHARAD_2025_VOICE = '963bbbe2f55b44c68fa867eaf9268d8f';

const QUALITY_OPTIONS = [
  { value: '720p', label: '720p — HD', rps: 4.80, note: 'Recommended' },
  { value: '4k',   label: '4K — Ultra HD', rps: 8.00, note: 'Best quality, 1.67× cost' },
];

interface JobResult {
  session_id?: string;
  video_id?: string;
  status?: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
}

export default function Studio() {
  const [prompt, setPrompt] = useState('');
  const [avatarId, setAvatarId] = useState(SHARAD_2025_ID);
  const [voiceId, setVoiceId] = useState('');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [quality, setQuality] = useState('720p');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioAssetId, setAudioAssetId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [result, setResult] = useState<JobResult | null>(null);
  const [error, setError] = useState('');

  const selectedQuality = QUALITY_OPTIONS.find(q => q.value === quality)!;

  async function uploadAudio(file: File): Promise<string> {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/assets/upload', { method: 'POST', body: form });
    const data = await res.json();
    setUploading(false);
    if (data.error) throw new Error(data.error);
    return data.data?.asset_id || data.asset_id;
  }

  async function pollVideo(videoId: string): Promise<JobResult> {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 8000));
      const res = await fetch(`/api/videos/${videoId}`);
      const data = await res.json();
      const v = data.data || data;
      if (v.status === 'completed' || v.status === 'failed') return v;
    }
    throw new Error('Timeout');
  }

  async function pollSession(sessionId: string): Promise<string> {
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();
      const s = data.data || data;
      if (s.video_id) return s.video_id;
    }
    throw new Error('Session timeout');
  }

  async function handleCreate() {
    if (!prompt.trim()) return setError('Prompt likhna zaroori hai');
    setError(''); setResult(null); setLoading(true);
    try {
      let assetId = audioAssetId;
      if (audioFile && !assetId) {
        assetId = await uploadAudio(audioFile);
        setAudioAssetId(assetId);
      }
      const body: Record<string, unknown> = { prompt, orientation };
      if (avatarId) body.avatar_id = avatarId;
      if (voiceId) body.voice_id = voiceId;
      if (quality === '4k') body.resolution = '4k';
      if (assetId) body.files = [{ type: 'asset_id', asset_id: assetId }];

      const res = await fetch('/api/videos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const session = data.data || data;
      if (session.error || data.error) throw new Error(session.error || data.error);

      setResult({ session_id: session.session_id, video_id: session.video_id, status: 'processing' });
      setPolling(true); setLoading(false);

      let videoId = session.video_id;
      if (!videoId && session.session_id) videoId = await pollSession(session.session_id);

      const video = await pollVideo(videoId);
      setResult({ ...video, session_id: session.session_id, video_id: videoId });
      setPolling(false);
    } catch (err: any) {
      setError(err.message); setLoading(false); setPolling(false);
    }
  }

  const busy = loading || uploading || polling;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Video Studio</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Prompt se AI video banao — Sharad 2025 avatar by default selected hai
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        {/* PROMPT */}
        <div className="field">
          <label>Prompt *</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="Example: Ek 60-second ka legal tips video banao jisme Sharad Sir clearly explain karein ki FIR kaise file karte hain..."
            rows={4} disabled={busy} />
        </div>

        {/* AVATAR + VOICE */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label>Avatar ID</label>
            <input value={avatarId} onChange={e => setAvatarId(e.target.value)} disabled={busy}
              placeholder="Avatar ID" />
            <div style={{ fontSize: 11, color: avatarId === SHARAD_2025_ID ? 'var(--success)' : 'var(--muted)', marginTop: 4 }}>
              {avatarId === SHARAD_2025_ID ? '✓ Sharad 2025 (latest)' : 'Custom avatar'}
            </div>
          </div>
          <div className="field">
            <label>Voice ID <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(blank = avatar default)</span></label>
            <input value={voiceId} onChange={e => setVoiceId(e.target.value)} disabled={busy}
              placeholder={`Default: ${SHARAD_2025_VOICE.slice(0,16)}...`} />
          </div>
        </div>

        {/* QUALITY + ORIENTATION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label>Quality</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {QUALITY_OPTIONS.map(q => (
                <button key={q.value} disabled={busy} onClick={() => setQuality(q.value)} style={{
                  flex: 1, padding: '10px 8px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: quality === q.value ? 'rgba(201,162,39,0.15)' : 'var(--surface)',
                  border: `1px solid ${quality === q.value ? 'var(--gold)' : 'var(--border)'}`,
                  color: quality === q.value ? 'var(--gold)' : 'var(--muted)',
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}>
                  <div>{q.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2 }}>₹{q.rps}/sec</div>
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Orientation</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { v: 'landscape', l: 'Landscape', sub: '16:9 YouTube' },
                { v: 'portrait',  l: 'Portrait',  sub: '9:16 Reels' },
              ].map(o => (
                <button key={o.v} disabled={busy} onClick={() => setOrientation(o.v as 'landscape' | 'portrait')} style={{
                  flex: 1, padding: '10px 8px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: orientation === o.v ? 'rgba(201,162,39,0.15)' : 'var(--surface)',
                  border: `1px solid ${orientation === o.v ? 'var(--gold)' : 'var(--border)'}`,
                  color: orientation === o.v ? 'var(--gold)' : 'var(--muted)',
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}>
                  <div>{o.l}</div>
                  <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2 }}>{o.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MP3 */}
        <div className="field">
          <label>MP3 Audio <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional — AI context ke liye)</span></label>
          <input type="file" accept=".mp3,audio/mpeg"
            onChange={e => { setAudioFile(e.target.files?.[0] || null); setAudioAssetId(''); }}
            disabled={busy} style={{ cursor: 'pointer' }} />
        </div>
        {audioAssetId && (
          <div className="success-box" style={{ marginBottom: 12 }}>
            Audio uploaded — Asset ID: <code style={{ fontSize: 11 }}>{audioAssetId}</code>
          </div>
        )}

        {/* COST ESTIMATE */}
        <div style={{ background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.2)',
          borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
          <span style={{ color: 'var(--muted)' }}>Estimated cost: </span>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{selectedQuality.rps}/sec</span>
          <span style={{ color: 'var(--muted)' }}> — 1 min video ≈ </span>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{(selectedQuality.rps * 60).toFixed(0)}</span>
          <span style={{ color: 'var(--muted)' }}>, 2 min ≈ </span>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{(selectedQuality.rps * 120).toFixed(0)}</span>
        </div>

        <button className="btn-gold" onClick={handleCreate} disabled={busy}
          style={{ width: '100%', padding: '13px 20px', fontSize: 15 }}>
          {uploading ? 'Audio upload ho rahi hai...' : loading ? 'Submit ho raha hai...' : polling ? 'Video ban rahi hai...' : 'Create Video'}
          {busy && <span className="spinner" style={{ marginLeft: 10 }} />}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Result</h3>
            <span className={`badge badge-${result.status === 'completed' ? 'completed' : result.status === 'failed' ? 'failed' : 'processing'}`}>
              {result.status}
            </span>
          </div>
          {result.session_id && <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Session: {result.session_id}</p>}
          {result.video_id && <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>Video ID: {result.video_id}</p>}
          {result.duration && (
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
              Duration: {result.duration.toFixed(1)}s &nbsp;|&nbsp;
              Approx cost: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{(selectedQuality.rps * result.duration).toFixed(0)}</span>
            </p>
          )}
          {result.thumbnail_url && (
            <img src={result.thumbnail_url} alt="thumbnail"
              style={{ width: '100%', maxWidth: 400, borderRadius: 8, marginBottom: 16 }} />
          )}
          {result.video_url && (
            <div style={{ display: 'flex', gap: 12 }}>
              <a href={result.video_url} target="_blank" rel="noreferrer">
                <button className="btn-gold">Watch Video</button>
              </a>
              <a href={result.video_url} download>
                <button className="btn-ghost">Download MP4</button>
              </a>
            </div>
          )}
          {polling && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', fontSize: 13 }}>
              <span className="spinner" /> Video ban rahi hai — 2–5 minute lagenge, page band mat karo
            </div>
          )}
          {result.status === 'failed' && (
            <p style={{ color: 'var(--danger)', fontSize: 14 }}>Video nahi bani. Dobara try karo.</p>
          )}
        </div>
      )}
    </div>
  );
}
