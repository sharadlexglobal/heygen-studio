import { useState } from 'react';

interface JobResult {
  session_id?: string;
  video_id?: string;
  status?: string;
  video_url?: string;
  thumbnail_url?: string;
  error?: string;
}

export default function Studio() {
  const [prompt, setPrompt] = useState('');
  const [avatarId, setAvatarId] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [audioAssetId, setAudioAssetId] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [result, setResult] = useState<JobResult | null>(null);
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

  async function pollVideo(videoId: string): Promise<JobResult> {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 8000));
      const res = await fetch(`/api/videos/${videoId}`);
      const data = await res.json();
      const video = data.data || data;
      if (video.status === 'completed' || video.status === 'failed') return video;
    }
    throw new Error('Timeout waiting for video');
  }

  async function pollSession(sessionId: string): Promise<string> {
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();
      const session = data.data || data;
      if (session.video_id) return session.video_id;
    }
    throw new Error('Session timeout');
  }

  async function handleCreate() {
    if (!prompt.trim()) return setError('Prompt required');
    setError('');
    setResult(null);
    setLoading(true);

    try {
      let assetId = audioAssetId;
      if (audioFile && !assetId) {
        assetId = await uploadAudio(audioFile);
        setAudioAssetId(assetId);
      }

      const body: Record<string, unknown> = { prompt, orientation };
      if (avatarId) body.avatar_id = avatarId;
      if (voiceId) body.voice_id = voiceId;
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
      setPolling(true);
      setLoading(false);

      let videoId = session.video_id;
      if (!videoId && session.session_id) {
        videoId = await pollSession(session.session_id);
      }

      const video = await pollVideo(videoId);
      setResult({ ...video, session_id: session.session_id, video_id: videoId });
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
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Video Studio</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Create AI videos from a prompt — optionally attach your MP3 audio</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="field">
          <label>Prompt *</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe the video you want to create..."
            rows={4}
            disabled={busy}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label>Avatar ID (optional)</label>
            <input
              value={avatarId}
              onChange={e => setAvatarId(e.target.value)}
              placeholder="Leave blank for auto-select"
              disabled={busy}
            />
          </div>
          <div className="field">
            <label>Voice ID (optional)</label>
            <input
              value={voiceId}
              onChange={e => setVoiceId(e.target.value)}
              placeholder="Leave blank for auto-select"
              disabled={busy}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label>Orientation</label>
            <select value={orientation} onChange={e => setOrientation(e.target.value as 'landscape' | 'portrait')} disabled={busy}>
              <option value="landscape">Landscape (16:9)</option>
              <option value="portrait">Portrait (9:16)</option>
            </select>
          </div>
          <div className="field">
            <label>MP3 Audio (optional)</label>
            <input
              type="file"
              accept=".mp3,audio/mpeg"
              onChange={e => { setAudioFile(e.target.files?.[0] || null); setAudioAssetId(''); }}
              disabled={busy}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>

        {audioAssetId && (
          <div className="success-box" style={{ marginBottom: 12 }}>
            Audio uploaded — Asset ID: <code style={{ fontSize: 11 }}>{audioAssetId}</code>
          </div>
        )}

        <button className="btn-gold" onClick={handleCreate} disabled={busy} style={{ width: '100%', padding: '12px 20px', fontSize: 15 }}>
          {uploading ? 'Uploading audio...' : loading ? 'Submitting...' : polling ? 'Generating video...' : 'Create Video'}
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
          {result.session_id && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Session: {result.session_id}</p>}
          {result.video_id && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Video ID: {result.video_id}</p>}
          {result.thumbnail_url && (
            <img src={result.thumbnail_url} alt="thumbnail" style={{ width: '100%', maxWidth: 400, borderRadius: 8, marginBottom: 16 }} />
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
          {result.status === 'failed' && (
            <p style={{ color: 'var(--danger)', fontSize: 14 }}>Generation failed. Please try again.</p>
          )}
          {polling && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', fontSize: 13 }}>
              <span className="spinner" /> Generating... this takes 1–3 minutes
            </div>
          )}
        </div>
      )}
    </div>
  );
}
