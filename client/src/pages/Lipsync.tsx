import { useState } from 'react';

interface LipsyncResult {
  lipsync_id?: string;
  status?: string;
  video_url?: string;
  error?: string;
}

export default function Lipsync() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoAssetId, setVideoAssetId] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioAssetId, setAudioAssetId] = useState('');
  const [mode, setMode] = useState<'speed' | 'precision'>('speed');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [result, setResult] = useState<LipsyncResult | null>(null);
  const [error, setError] = useState('');

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
    throw new Error('Timeout waiting for lipsync');
  }

  async function handleLipsync() {
    if (!videoUrl && !videoAssetId) return setError('Video URL or Asset ID required');
    if (!audioFile && !audioAssetId) return setError('MP3 audio required');
    setError('');
    setResult(null);
    setLoading(true);

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
      setLoading(false);
      setPolling(true);

      const final = await pollLipsync(lipsyncId);
      setResult({ ...final, lipsync_id: lipsyncId });
      setPolling(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setPolling(false);
    }
  }

  const busy = loading || uploading || polling;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Lipsync</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Replace avatar audio with your MP3 — perfect lip-sync automatically</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', background: 'rgba(201,162,39,0.06)', borderRadius: 8, marginBottom: 20, fontSize: 13, color: 'var(--muted)', borderLeft: '3px solid var(--gold)' }}>
          Workflow: Upload your MP3 → provide source video → get lipsync video where avatar speaks your audio
        </div>

        <div className="field">
          <label>MP3 Audio *</label>
          <input
            type="file"
            accept=".mp3,audio/mpeg"
            onChange={e => { setAudioFile(e.target.files?.[0] || null); setAudioAssetId(''); }}
            disabled={busy}
            style={{ cursor: 'pointer' }}
          />
        </div>

        {audioAssetId && (
          <div className="success-box" style={{ marginBottom: 12 }}>
            Audio ready — Asset ID: <code style={{ fontSize: 11 }}>{audioAssetId}</code>
          </div>
        )}

        <div className="field">
          <label>Source Video URL</label>
          <input
            value={videoUrl}
            onChange={e => { setVideoUrl(e.target.value); setVideoAssetId(''); }}
            placeholder="https://... (MP4 video with avatar)"
            disabled={busy}
          />
        </div>

        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginBottom: 12 }}>— or —</div>

        <div className="field">
          <label>Source Video Asset ID</label>
          <input
            value={videoAssetId}
            onChange={e => { setVideoAssetId(e.target.value); setVideoUrl(''); }}
            placeholder="asset_id from uploaded video"
            disabled={busy}
          />
        </div>

        <div className="field">
          <label>Mode</label>
          <select value={mode} onChange={e => setMode(e.target.value as 'speed' | 'precision')} disabled={busy}>
            <option value="speed">Speed (faster)</option>
            <option value="precision">Precision (better quality)</option>
          </select>
        </div>

        <button className="btn-gold" onClick={handleLipsync} disabled={busy} style={{ width: '100%', padding: '12px 20px', fontSize: 15 }}>
          {uploading ? 'Uploading MP3...' : loading ? 'Submitting...' : polling ? 'Processing lipsync...' : 'Create Lipsync Video'}
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
          {result.lipsync_id && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Job ID: {result.lipsync_id}</p>}
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
              <span className="spinner" /> Processing... 1–3 minutes
            </div>
          )}
        </div>
      )}
    </div>
  );
}
