import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllSessions } from '../api/api';
import type { SessionType } from '../types';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [search, setSearch] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchAllSessions()
      .then(r => { setSessions(r.data.sessions || []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const filtered = sessions.filter(s => s.sessionName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      <Navbar loggedIn />
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', paddingTop: 68 }}>

        {/* Sidebar */}
        <div style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)', padding: '2rem 0.75rem', position: 'sticky', top: 68, height: 'calc(100vh - 68px)', overflowY: 'auto' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.14em', color: 'var(--dim)', padding: '0 0.75rem', marginBottom: '0.5rem' }}>NAVIGATION</div>
          {[
            { icon: '◈', label: 'DASHBOARD', path: '/dashboard', active: true },
            { icon: '⏺', label: 'NEW SESSION', path: '/createSession' },
            { icon: '→', label: 'JOIN SESSION', path: '/joinSession' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 6, fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.08em', color: item.active ? 'var(--red)' : 'var(--muted)', background: item.active ? 'var(--red-dim)' : 'none', border: item.active ? '1px solid rgba(255,45,59,0.2)' : '1px solid transparent', cursor: 'pointer', width: '100%', textAlign: 'left', marginBottom: 3, transition: 'all 0.2s' }}>
              <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{item.icon}</span> {item.label}
            </button>
          ))}

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.14em', color: 'var(--dim)', padding: '0 0.75rem', margin: '1.5rem 0 0.5rem' }}>LIBRARY</div>
          {[{ icon: '▶', label: 'RECORDINGS' }, { icon: '◉', label: 'ALL SESSIONS', path: '/allSessions' }].map(item => (
            <button key={item.label} onClick={() => item.path && navigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 6, fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--muted)', background: 'none', border: '1px solid transparent', cursor: 'pointer', width: '100%', textAlign: 'left', marginBottom: 3 }}>
              <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{item.icon}</span> {item.label}
            </button>
          ))}

          <div style={{ position: 'absolute', bottom: '2rem', left: '0.75rem', right: '0.75rem' }}>
            <button onClick={() => { localStorage.removeItem('JWT'); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 6, fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--dim)', background: 'none', border: '1px solid transparent', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
              <span style={{ fontFamily: 'var(--font-mono)' }}>⎋</span> SIGN OUT
            </button>
          </div>
        </div>

        {/* Main */}
        <div style={{ padding: '2.5rem', overflowY: 'auto' }}>
          {/* Header */}
          <div className="anim-fadeUp" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.14em', color: 'var(--red)', marginBottom: '0.5rem' }}>// CONTROL ROOM</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', letterSpacing: '0.04em', lineHeight: 0.95 }}>DASHBOARD</h1>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => navigate('/joinSession')} style={{ padding: '10px 20px', borderRadius: 6, background: 'transparent', color: 'var(--text)', border: '1px solid var(--border2)', fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.08em', cursor: 'pointer' }}>JOIN SESSION</button>
              <button onClick={() => navigate('/createSession')} style={{ padding: '10px 20px', borderRadius: 6, background: 'var(--red)', color: 'white', border: 'none', fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.08em', cursor: 'pointer', boxShadow: '0 0 20px rgba(255,45,59,0.3)' }}>⏺ NEW SESSION</button>
            </div>
          </div>

          {/* Stats */}
          <div className="anim-fadeUp-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1px', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: '2rem' }}>
            {[
              { label: 'TOTAL SESSIONS', val: loaded ? sessions.length.toString() : '—', accent: 'var(--red)' },
              { label: 'RECORDING HRS', val: '16.5', accent: 'var(--amber)' },
              { label: 'STORAGE USED', val: '3.8 GB', accent: 'var(--cyan)' },
              { label: 'MAX QUALITY', val: '1080P', accent: 'var(--green)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface)', padding: '1.5rem', borderTop: `3px solid ${s.accent}` }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--dim)', marginBottom: '0.75rem' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', letterSpacing: '0.04em', color: 'var(--text)', animation: 'countUp 0.5s ease both' }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Sessions Table */}
          <div className="anim-fadeUp-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.06em' }}>RECENT SESSIONS</div>
              <input type="text" placeholder="Search sessions..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '7px 12px', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', outline: 'none', width: 200 }} />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface2)' }}>
                  {['SESSION NAME', 'CODE', 'PARTICIPANTS', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'var(--dim)', borderBottom: '1px solid var(--border)', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((s, i) => (
                  <tr key={s.id.toString()} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? 'var(--green)' : 'var(--dim)', animation: i === 0 ? 'pulse 2s ease-in-out infinite' : 'none' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{s.sessionName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <code style={{ padding: '3px 8px', borderRadius: 4, background: 'var(--surface3)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.06em' }}>{s.sessionCode}</code>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--dim)' }}>2 / 5</td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => navigate('/recentSession', { state: { sessionId: s.id } })} style={{ padding: '6px 14px', borderRadius: 5, background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(255,45,59,0.25)', fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.08em', cursor: 'pointer' }}>
                        OPEN →
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} style={{ padding: '4rem 2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--dim)', letterSpacing: '0.08em' }}>
                    NO SESSIONS FOUND — CREATE YOUR FIRST RECORDING
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Quick actions */}
          <div className="anim-fadeUp-3" style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.08em', marginBottom: '1rem', color: 'var(--dim)' }}>QUICK ACTIONS</div>
          <div className="anim-fadeUp-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1px', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            {[
              { icon: '⏺', label: 'NEW RECORDING SESSION', desc: 'Create a room, get a code, go live', path: '/createSession', hot: true },
              { icon: '→', label: 'JOIN AS GUEST', desc: 'Enter a session code to participate', path: '/joinSession', hot: false },
              { icon: '◉', label: 'ALL SESSIONS', desc: 'Browse your complete recording library', path: '/allSessions', hot: false },
            ].map(a => (
              <div key={a.label} onClick={() => navigate(a.path)} style={{ background: a.hot ? 'linear-gradient(135deg,var(--surface),rgba(255,45,59,0.04))' : 'var(--surface)', padding: '2rem', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'flex-start', gap: '1.25rem', borderTop: a.hot ? '2px solid var(--red)' : '2px solid transparent' }}
                onMouseEnter={e => !a.hot && ((e.currentTarget as HTMLDivElement).style.background = 'var(--surface2)')}
                onMouseLeave={e => !a.hot && ((e.currentTarget as HTMLDivElement).style.background = 'var(--surface)')}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: a.hot ? 'var(--red-dim)' : 'var(--surface3)', border: `1px solid ${a.hot ? 'rgba(255,45,59,0.25)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '1rem', color: a.hot ? 'var(--red)' : 'var(--muted)', flexShrink: 0 }}>{a.icon}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>{a.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 300 }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
