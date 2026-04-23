import { useState } from 'react';

const AVATAR_ID = '016ed92e82954f92871f6b647f65f12d';

const RESOLUTIONS = [
  {
    value: '1080p',
    label: '1080p',
    sub: 'HD · ₹4.8/sec',
    w: 1080, h: 1920,
    rps: 4.80,
  },
  {
    value: '4k',
    label: '4K',
    sub: 'Ultra HD · ₹8/sec',
    w: 2160, h: 3840,
    rps: 8.00,
  },
];

interface Result {
  video_id?: string;
  status?: string;
  video_url?: string;
  duration?: number;
}

export default function Anushka() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioAssetId, setAudioAssetId] = useState('');
  const [resolution, setResolution] = useState('1080p');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  const res = RESOLUTIONS.find(r => r.value === resolution)!;

  async function uploadMp3(file: File): Promise<string> {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    const r = await fetch('/api/assets/upload', { method: 'POST', body: form });
    const d = await r.json();
    setUploading(false);
    if (d.error) throw new Error(d.error);
    return d.data?.asset_id || d.asset_id;
  }

  async function pollVideo(videoId: string): Promise<Result> {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 8000));
      const r = await fetch(`/api/videos/${videoId}`);
      const d = await r.json();
      const v = d.data || d;
      if (v.status === 'completed' || v.status === 'failed') return v;
    }
    throw new Error('Timeout');
  }

  async function handleGenerate() {
    if (!audioFile && !audioAssetId) return setError('MP3 file select karo');
    setError(''); setResult(null); setLoading(true);
    try {
      let assetId = audioAssetId;
      if (audioFile && !assetId) {
        assetId = await uploadMp3(audioFile);
        setAudioAssetId(assetId);
      }

      const body = {
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: AVATAR_ID,
            avatar_style: 'normal',
          },
          voice: {
            type: 'audio',
            audio_asset_id: assetId,
          },
        }],
        dimension: { width: res.w, height: res.h },
      };

      const r = await fetch('/api/videos/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      const job = d.data || d;
      if (d.error || job.error) throw new Error(d.error?.message || job.error?.message || JSON.stringify(d.error || job.error));

      const videoId = job.video_id;
      setResult({ video_id: videoId, status: 'processing' });
      setLoading(false); setPolling(true);

      const final = await pollVideo(videoId);
      setResult({ ...final, video_id: videoId });
      setPolling(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false); setPolling(false);
    }
  }

  const busy = uploading || loading || polling;

  return (
    <div style={{ maxWidth: 480 }}>

      {/* HEADER */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6 }}>
          Sharad 2025 · 9:16
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>Anushka</h1>
      </div>

      {/* MP3 UPLOAD */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)',
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Audio
        </div>
        <label htmlFor="mp3-input" style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '18px 20px', borderRadius: 12, cursor: busy ? 'not-allowed' : 'pointer',
          border: `1px solid ${audioFile ? 'var(--gold)' : 'var(--border)'}`,
          background: audioFile ? 'rgba(201,162,39,0.06)' : 'var(--card)',
          transition: 'all 0.2s',
        }}>
          <span style={{ fontSize: 24 }}>↑</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600,
              color: audioFile ? 'var(--text)' : 'var(--muted)' }}>
              {audioFile ? audioFile.name : 'MP3 file choose karo'}
            </div>
            {audioFile
              ? <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 2 }}>
                  {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                </div>
              : <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  .mp3 · max 32 MB
                </div>
            }
          </div>
        </label>
        <input id="mp3-input" type="file" accept=".mp3,audio/mpeg"
          style={{ display: 'none' }}
          disabled={busy}
          onChange={e => {
            setAudioFile(e.target.files?.[0] || null);
            setAudioAssetId('');
            setResult(null);
          }} />
        {audioAssetId && (
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--success)' }}>
            ✓ Uploaded — {audioAssetId.slice(0, 20)}...
          </div>
        )}
      </div>

      {/* RESOLUTION */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)',
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Resolution
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {RESOLUTIONS.map(r => (
            <button key={r.value} disabled={busy} onClick={() => setResolution(r.value)} style={{
              flex: 1, padding: '16px 12px', borderRadius: 12, cursor: busy ? 'not-allowed' : 'pointer',
              background: resolution === r.value ? 'rgba(201,162,39,0.1)' : 'var(--card)',
              border: `1px solid ${resolution === r.value ? 'var(--gold)' : 'var(--border)'}`,
              color: resolution === r.value ? 'var(--gold)' : 'var(--muted)',
              textAlign: 'left', transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{r.label}</div>
              <div style={{ fontSize: 12 }}>{r.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* GENERATE BUTTON */}
      <button
        onClick={handleGenerate}
        disabled={busy || (!audioFile && !audioAssetId)}
        style={{
          width: '100%', padding: '16px', borderRadius: 12, fontSize: 15,
          fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
          background: busy ? 'rgba(201,162,39,0.4)' : 'var(--gold)',
          color: '#000', border: 'none', transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
        {uploading ? 'Upload ho rahi hai...'
          : loading ? 'Request bhej raha hai...'
          : polling ? 'Video ban rahi hai...'
          : 'Generate Video'}
        {busy && <span className="spinner" style={{ borderTopColor: '#000', borderColor: 'rgba(0,0,0,0.2)' }} />}
      </button>

      {/* ERROR */}
      {error && (
        <div className="error" style={{ marginTop: 16 }}>{error}</div>
      )}

      {/* RESULT */}
      {result && (
        <div style={{ marginTop: 24 }}>
          {(polling || result.status === 'processing') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px', borderRadius: 12, background: 'var(--card)',
              border: '1px solid var(--border)', fontSize: 14, color: 'var(--muted)' }}>
              <span className="spinner" />
              Video ban rahi hai — 2–4 minute lagenge. Page band mat karo.
            </div>
          )}

          {result.status === 'completed' && result.video_url && (
            <div style={{ borderRadius: 12, overflow: 'hidden',
              border: '1px solid var(--border)', background: 'var(--card)' }}>
              <video
                src={result.video_url}
                controls
                style={{ width: '100%', display: 'block', aspectRatio: '9/16', background: '#000' }}
              />
              <div style={{ padding: '16px', display: 'flex', gap: 10 }}>
                {result.duration && (
                  <div style={{ fontSize: 13, color: 'var(--muted)', flex: 1 }}>
                    {result.duration.toFixed(1)}s ·{' '}
                    <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
                      ₹{(res.rps * result.duration).toFixed(0)}
                    </span>
                  </div>
                )}
                <a href={result.video_url} download>
                  <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
                    Download
                  </button>
                </a>
                <a href={result.video_url} target="_blank" rel="noreferrer">
                  <button className="btn-gold" style={{ padding: '8px 16px', fontSize: 13 }}>
                    Open
                  </button>
                </a>
              </div>
            </div>
          )}

          {result.status === 'failed' && (
            <div className="error" style={{ marginTop: 0 }}>
              Video nahi bani. Dobara try karo.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
