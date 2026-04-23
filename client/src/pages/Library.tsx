import { useState, useEffect } from 'react';

interface Video {
  id: string;
  status: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  created_at?: number;
  title?: string;
}

export default function Library() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  async function loadVideos(token?: string) {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (token) params.set('token', token);
      const res = await fetch(`/api/videos?${params}`);
      const data = await res.json();
      const list = data.data?.videos || data.data || data.videos || [];
      if (token) setVideos(v => [...v, ...list]);
      else setVideos(list);
      setNextToken(data.data?.next_token || data.next_token || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function refreshVideo(id: string) {
    setRefreshing(id);
    try {
      const res = await fetch(`/api/videos/${id}`);
      const data = await res.json();
      const updated = data.data || data;
      setVideos(v => v.map(vid => vid.id === id ? { ...vid, ...updated } : vid));
    } finally {
      setRefreshing(null);
    }
  }

  async function deleteVideo(id: string) {
    if (!confirm('Delete this video?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      setVideos(v => v.filter(vid => vid.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  useEffect(() => { loadVideos(); }, []);

  const statusClass = (s: string) => s === 'completed' ? 'completed' : s === 'failed' ? 'failed' : s === 'processing' ? 'processing' : 'pending';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Library</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>All your generated videos</p>
        </div>
        <button className="btn-ghost" onClick={() => loadVideos()} disabled={loading}>
          {loading ? <span className="spinner" /> : 'Refresh'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {!loading && videos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>▦</div>
          <div>No videos yet. Create one in Studio.</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {videos.map(v => (
          <div key={v.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {v.thumbnail_url ? (
              <img src={v.thumbnail_url} alt="" style={{ width: 100, height: 56, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
            ) : (
              <div style={{ width: 100, height: 56, background: 'var(--border)', borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--muted)' }}>▶</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span className={`badge badge-${statusClass(v.status)}`}>{v.status}</span>
                {v.duration && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{v.duration.toFixed(1)}s</span>}
              </div>
              <code style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.id}</code>
              {v.created_at && (
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(v.created_at * 1000).toLocaleString()}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {(v.status === 'pending' || v.status === 'processing') && (
                <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => refreshVideo(v.id)} disabled={refreshing === v.id}>
                  {refreshing === v.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '↺'}
                </button>
              )}
              {v.video_url && (
                <a href={v.video_url} target="_blank" rel="noreferrer">
                  <button className="btn-gold" style={{ padding: '6px 14px', fontSize: 12 }}>Watch</button>
                </a>
              )}
              {v.video_url && (
                <a href={v.video_url} download>
                  <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }}>↓</button>
                </a>
              )}
              <button className="btn-danger" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => deleteVideo(v.id)} disabled={deleting === v.id}>
                {deleting === v.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '✕'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {nextToken && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button className="btn-ghost" onClick={() => loadVideos(nextToken)} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
