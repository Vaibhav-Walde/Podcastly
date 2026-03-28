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

  const accents = [
    { color: 'var(--red)', bg: 'rgba(255,45,59,0.1)', border: 'rgba(255,45,59,0.25)' },
    { color: 'var(--amber)', bg: 'rgba(255,170,0,0.1)', border: 'rgba(255,170,0,0.25)' },
    { color: 'var(--cyan)', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.25)' },
    { color: 'var(--green)', bg: 'rgba(0,230,118,0.1)', border: 'rgba(0,230,118,0.25)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      <Navbar loggedIn />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 2rem 3rem' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.08em', marginBottom: '2rem', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          ← BACK TO DASHBOARD
        </button>

        <div className="anim-fadeUp" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.14em', color: 'var(--red)', marginBottom: '0.75rem' }}>// SESSION RECORDINGS</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', letterSpacing: '0.04em', lineHeight: 0.95 }}>TRACK<br />LIBRARY</h1>
          </div>
          <button onClick={load} disabled={loading} style={{ padding: '12px 28px', background: fetched ? 'transparent' : 'var(--red)', color: fetched ? 'var(--text)' : 'white', border: fetched ? '1px solid var(--border2)' : 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.1em', boxShadow: fetched ? 'none' : '0 0 20px rgba(255,45,59,0.3)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'LOADING...' : fetched ? '↺ REFRESH' : '⬇ LOAD TRACKS'}
          </button>
        </div>

        {!fetched && (
          <div className="anim-fadeUp-1" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '5rem 2rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', letterSpacing: '0.04em', color: 'var(--dim)', marginBottom: '1rem' }}>⏺</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>TRACKS READY TO LOAD</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Click "LOAD TRACKS" to fetch recordings from this session</p>
          </div>
        )}

        {fetched && recs.length === 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '5rem 2rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>NO TRACKS FOUND</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Session may still be processing or has no recordings</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recs.map((rec, idx) => {
            const a = accents[idx % accents.length];
            return (
              <div key={rec.id} className="anim-fadeUp" style={{ background: 'var(--surface)', border: `1px solid ${a.border}`, borderRadius: 12, overflow: 'hidden', borderLeft: `4px solid ${a.color}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '1.25rem 1.5rem', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: a.bg, border: `1px solid ${a.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: a.color, flexShrink: 0 }}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: 2 }}>{rec.trackName || `Track ${idx + 1}`}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em', color: 'var(--dim)' }}>
                        USER {rec.userId} · SESSION {rec.sessionId} · <span style={{ color: 'var(--green)' }}>S3 UPLOADED ✓</span>
                      </div>
                    </div>
                  </div>
                  <a href={rec.s3Url} download={`track-${idx + 1}-session-${sessionId}.webm`} style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--surface3)', color: 'var(--text)', border: '1px solid var(--border2)', fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '0.08em', textDecoration: 'none', display: 'inline-block' }}>
                    ⬇ DOWNLOAD
                  </a>
                </div>
                <div style={{ borderTop: `1px solid ${a.border}` }}>
                  <video src={rec.s3Url} controls style={{ width: '100%', maxHeight: 300, background: 'var(--black)', display: 'block' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
