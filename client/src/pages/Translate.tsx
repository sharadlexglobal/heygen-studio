import { useState, useEffect } from 'react';

interface TranslateResult {
  id?: string;
  status?: string;
  video_url?: string;
  error?: string;
}

export default function Translate() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoAssetId, setVideoAssetId] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [targetLang, setTargetLang] = useState('');
  const [supportedLangs, setSupportedLangs] = useState<{code: string; name: string}[]>([]);
  const [mode, setMode] = useState<'speed' | 'precision'>('speed');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/translate-languages')
      .then(r => r.json())
      .then(data => {
        const langs = data.data?.languages || data.data || data.languages || [];
        setSupportedLangs(langs);
      })
      .catch(() => {});
  }, []);

  async function pollTranslation(id: string): Promise<TranslateResult> {
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 8000));
      const res = await fetch(`/api/translate/${id}`);
      const data = await res.json();
      const job = data.data || data;
      if (job.status === 'completed' || job.status === 'failed') return job;
    }
    throw new Error('Timeout');
  }

  async function handleTranslate() {
    if (!videoUrl && !videoAssetId) return setError('Video source required');
    if (languages.length === 0) return setError('Select at least one language');
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const video = videoAssetId || videoUrl;
      const body = {
        video,
        output_languages: languages,
        mode,
      };
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const job = data.data || data;
      if (job.error || data.error) throw new Error(job.error || data.error);

      const jobId = job.id || job.translation_id;
      setResult({ id: jobId, status: 'processing' });
      setLoading(false);
      setPolling(true);

      const final = await pollTranslation(jobId);
      setResult({ ...final, id: jobId });
      setPolling(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setPolling(false);
    }
  }

  function toggleLang(code: string) {
    setLanguages(l => l.includes(code) ? l.filter(x => x !== code) : [...l, code]);
  }

  const busy = loading || polling;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Translate</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Translate videos to 30+ languages with lip-sync</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="field">
          <label>Source Video URL</label>
          <input
            value={videoUrl}
            onChange={e => { setVideoUrl(e.target.value); setVideoAssetId(''); }}
            placeholder="https://... (MP4)"
            disabled={busy}
          />
        </div>

        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginBottom: 12 }}>— or —</div>

        <div className="field">
          <label>Source Video Asset ID</label>
          <input
            value={videoAssetId}
            onChange={e => { setVideoAssetId(e.target.value); setVideoUrl(''); }}
            placeholder="asset_id"
            disabled={busy}
          />
        </div>

        <div className="field">
          <label>Target Languages</label>
          {supportedLangs.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '12px', background: 'var(--surface)', borderRadius: 8 }}>
              {supportedLangs.map(l => (
                <button
                  key={l.code}
                  onClick={() => toggleLang(l.code)}
                  disabled={busy}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: languages.includes(l.code) ? 'var(--gold)' : 'var(--border)',
                    color: languages.includes(l.code) ? '#000' : 'var(--muted)',
                    border: 'none',
                  }}
                >
                  {l.name || l.code}
                </button>
              ))}
            </div>
          ) : (
            <input
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
              placeholder="e.g. hi (Hindi), es (Spanish)"
              disabled={busy}
              onBlur={() => { if (targetLang) setLanguages([targetLang]); }}
            />
          )}
        </div>

        {languages.length > 0 && (
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
            Selected: {languages.join(', ')}
          </div>
        )}

        <div className="field">
          <label>Mode</label>
          <select value={mode} onChange={e => setMode(e.target.value as 'speed' | 'precision')} disabled={busy}>
            <option value="speed">Speed (faster)</option>
            <option value="precision">Precision (better quality + lipsync)</option>
          </select>
        </div>

        <button className="btn-gold" onClick={handleTranslate} disabled={busy} style={{ width: '100%', padding: '12px 20px', fontSize: 15 }}>
          {loading ? 'Submitting...' : polling ? 'Translating...' : 'Translate Video'}
          {busy && <span className="spinner" style={{ marginLeft: 10 }} />}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Translation Job</h3>
            <span className={`badge badge-${result.status === 'completed' ? 'completed' : result.status === 'failed' ? 'failed' : 'processing'}`}>
              {result.status}
            </span>
          </div>
          {result.id && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Job ID: {result.id}</p>}
          {result.video_url && (
            <div style={{ display: 'flex', gap: 12 }}>
              <a href={result.video_url} target="_blank" rel="noreferrer">
                <button className="btn-gold">Watch</button>
              </a>
              <a href={result.video_url} download>
                <button className="btn-ghost">Download</button>
              </a>
            </div>
          )}
          {polling && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', fontSize: 13 }}>
              <span className="spinner" /> Translating... 2–5 minutes
            </div>
          )}
        </div>
      )}
    </div>
  );
}
