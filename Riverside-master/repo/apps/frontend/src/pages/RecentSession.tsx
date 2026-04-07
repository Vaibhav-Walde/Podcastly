import { useLocation, useNavigate } from 'react-router-dom';
import { getAllVideosApi } from '../api/api';
import { useState } from 'react';
import Navbar from '../components/Navbar';

interface Rec { id: number; s3Url: string; userId: number; sessionId: number; trackName?: string; }

export default function RecentSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = location?.state?.sessionId;
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  async function load() {
    setLoading(true);
    try { const r = await getAllVideosApi(sessionId); setRecs(r.data.recordings || []); }
    catch (e) { console.error(e); }
    setLoading(false); setFetched(true);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar loggedIn />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '120px 2rem 4rem' }}>
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'none', border: 'none', color: 'var(--secondary)',
          cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
          marginBottom: '2rem', padding: 0, fontFamily: 'var(--font)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>← Back to Dashboard</button>

        <div className="anim-fadeUp" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem',
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Track Library</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>
              {fetched ? `${recs.length} tracks found` : 'Load tracks from this session'}
            </p>
          </div>
          <button onClick={load} disabled={loading} style={{
            padding: '10px 24px', background: fetched ? 'transparent' : 'var(--accent)',
            color: fetched ? 'var(--text)' : 'white',
            border: fetched ? '1px solid var(--border)' : 'none',
            borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font)',
            fontSize: '0.85rem', fontWeight: 600, opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s',
          }}>
            {loading ? 'Loading...' : fetched ? '↻ Refresh' : '↓ Load Tracks'}
          </button>
        </div>

        {!fetched && (
          <div className="anim-fadeUp-1" style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '5rem 2rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎙</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Tracks ready to load</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Click "Load Tracks" to fetch recordings from this session</p>
          </div>
        )}

        {fetched && recs.length === 0 && (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '5rem 2rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>No tracks found</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>Session may still be processing</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recs.map((rec, idx) => (
            <div key={rec.id} className="anim-fadeUp" style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem 1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--accent)',
                  }}>{String(idx + 1).padStart(2, '0')}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rec.trackName || `Track ${idx + 1}`}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--tertiary)', marginTop: 2 }}>
                      User {rec.userId} · <span style={{ color: 'var(--green)' }}>Uploaded ✓</span>
                    </div>
                  </div>
                </div>
                <a href={rec.s3Url} download={`track-${idx + 1}-session-${sessionId}.webm`} style={{
                  padding: '7px 14px', borderRadius: 8, background: 'var(--surface2)',
                  color: 'var(--text)', border: '1px solid var(--border)',
                  fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
                  fontFamily: 'var(--font)', transition: 'all 0.2s',
                }}>↓ Download</a>
              </div>
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <video src={rec.s3Url} controls style={{ width: '100%', maxHeight: 280, background: '#000', display: 'block' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
