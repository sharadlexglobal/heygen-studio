import { useState } from 'react';

const MODE_OPTIONS = [
  { value: 'speed',     label: 'Speed',     rps: 3.20, note: 'Fast, thoda kum accurate' },
  { value: 'precision', label: 'Precision', rps: 6.40, note: 'Bilkul sahi lipsync, 2× cost' },
];

interface LipsyncResult {
  lipsync_id?: string;
  status?: string;
  video_url?: string;
  duration?: number;
}

export default function Lipsync() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoAssetId, setVideoAssetId] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioAssetId, setAudioAssetId] = useState('');
  const [mode, setMode] = useState('speed');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [result, setResult] = useState<LipsyncResult | null>(null);
  const [error, setError] = useState('');

  const selectedMode = MODE_OPTIONS.find(m => m.value === mode)!;

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

  async function pollLipsync(id: string): Promise<LipsyncResult> {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 8000));
      const res = await fetch(`/api/lipsync/${id}`);
      const data = await res.json();
      const job = data.data || data;
      if (job.status === 'completed' || job.status === 'failed') return job;
    }
    throw new Error('Timeout');
  }

  async function handleLipsync() {
    if (!videoUrl && !videoAssetId) return setError('Source video URL ya Asset ID do');
    if (!audioFile && !audioAssetId) return setError('MP3 audio file zaroori hai');
    setError(''); setResult(null); setLoading(true);
    try {
      let assetId = audioAssetId;
      if (audioFile && !assetId) {
        assetId = await uploadAudio(audioFile);
        setAudioAssetId(assetId);
      }
      const body: Record<string, unknown> = { mode };
      if (videoAssetId) body.video_asset_id = videoAssetId;
      else body.video_url = videoUrl;
      body.audio_asset_id = assetId;

      const res = await fetch('/api/lipsync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const job = data.data || data;
      if (job.error || data.error) throw new Error(job.error || data.error);

      const lipsyncId = job.lipsync_id || job.id;
      setResult({ lipsync_id: lipsyncId, status: 'processing' });
      setLoading(false); setPolling(true);

      const final = await pollLipsync(lipsyncId);
      setResult({ ...final, lipsync_id: lipsyncId });
      setPolling(false);
    } catch (err: any) {
      setError(err.message); setLoading(false); setPolling(false);
    }
  }

  const busy = loading || uploading || polling;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Lipsync</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          MP3 audio do + source video do → avatar aapki awaaz se bolega
        </p>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {[
          { step: '1', label: 'MP3 Upload karo', icon: '↑' },
          { step: '2', label: 'Source video do', icon: '▶' },
          { step: '3', label: 'Quality choose karo', icon: '◈' },
          { step: '4', label: 'Lipsync video ready', icon: '✓' },
        ].map((s, i, arr) => (
          <div key={s.step} style={{
            flex: 1, padding: '12px 8px', textAlign: 'center',
            background: i === 3 ? 'rgba(201,162,39,0.08)' : 'var(--surface)',
            borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 11, color: i === 3 ? 'var(--gold)' : 'var(--muted)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        {/* MP3 UPLOAD */}
        <div className="field">
          <label>MP3 Audio *</label>
          <input type="file" accept=".mp3,audio/mpeg"
            onChange={e => { setAudioFile(e.target.files?.[0] || null); setAudioAssetId(''); }}
            disabled={busy} style={{ cursor: 'pointer' }} />
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
            Max 32 MB • Sirf .mp3 format • Clear awaaz honi chahiye
          </div>
        </div>

        {audioAssetId && (
          <div className="success-box" style={{ marginBottom: 16 }}>
            Audio ready — Asset ID: <code style={{ fontSize: 11 }}>{audioAssetId}</code>
          </div>
        )}

        {/* SOURCE VIDEO */}
        <div className="field">
          <label>Source Video URL *</label>
          <input value={videoUrl} onChange={e => { setVideoUrl(e.target.value); setVideoAssetId(''); }}
            placeholder="https://... (MP4 video jis pe lipsync lagani hai)"
            disabled={busy} />
        </div>

        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, margin: '0 0 12px' }}>— ya —</div>

        <div className="field">
          <label>Source Video Asset ID</label>
          <input value={videoAssetId} onChange={e => { setVideoAssetId(e.target.value); setVideoUrl(''); }}
            placeholder="Pehle upload ki gayi video ka asset_id"
            disabled={busy} />
        </div>

        {/* QUALITY / MODE */}
        <div className="field">
          <label>Quality / Mode</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {MODE_OPTIONS.map(m => (
              <button key={m.value} disabled={busy} onClick={() => setMode(m.value)} style={{
                flex: 1, padding: '12px 10px', borderRadius: 10, cursor: busy ? 'not-allowed' : 'pointer',
                background: mode === m.value ? 'rgba(201,162,39,0.12)' : 'var(--surface)',
                border: `1px solid ${mode === m.value ? 'var(--gold)' : 'var(--border)'}`,
                color: mode === m.value ? 'var(--gold)' : 'var(--muted)',
                textAlign: 'left',
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{m.label}</div>
                <div style={{ fontSize: 12, marginBottom: 4 }}>{m.note}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>₹{m.rps}/sec</div>
                <div style={{ fontSize: 11, marginTop: 2 }}>1 min = ₹{(m.rps * 60).toFixed(0)} | 2 min = ₹{(m.rps * 120).toFixed(0)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* COST ESTIMATE */}
        <div style={{ background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.2)',
          borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
          <span style={{ color: 'var(--muted)' }}>Selected: </span>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{selectedMode.label} — ₹{selectedMode.rps}/sec</span>
          <span style={{ color: 'var(--muted)' }}> &nbsp;|&nbsp; 30 sec = </span>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{(selectedMode.rps * 30).toFixed(0)}</span>
          <span style={{ color: 'var(--muted)' }}> &nbsp;|&nbsp; 1 min = </span>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{(selectedMode.rps * 60).toFixed(0)}</span>
          <span style={{ color: 'var(--muted)' }}> &nbsp;|&nbsp; 5 min = </span>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{(selectedMode.rps * 300).toFixed(0)}</span>
        </div>

        <button className="btn-gold" onClick={handleLipsync} disabled={busy}
          style={{ width: '100%', padding: '13px 20px', fontSize: 15 }}>
          {uploading ? 'MP3 upload ho rahi hai...' : loading ? 'Submit ho raha hai...' : polling ? 'Lipsync ban rahi hai...' : 'Create Lipsync Video'}
          {busy && <span className="spinner" style={{ marginLeft: 10 }} />}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Lipsync Job</h3>
            <span className={`badge badge-${result.status === 'completed' ? 'completed' : result.status === 'failed' ? 'failed' : 'processing'}`}>
              {result.status}
            </span>
          </div>
          {result.lipsync_id && (
            <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>Job ID: {result.lipsync_id}</p>
          )}
          {result.duration && (
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
              Duration: {result.duration.toFixed(1)}s &nbsp;|&nbsp;
              Actual cost: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{(selectedMode.rps * result.duration).toFixed(0)}</span>
            </p>
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
              <span className="spinner" /> Processing... 1–3 minute lagenge, page band mat karo
            </div>
          )}
        </div>
      )}
    </div>
  );
}
