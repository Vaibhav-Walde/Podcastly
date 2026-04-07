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

  const sideItems = [
    { icon: '◇', label: 'Dashboard', path: '/dashboard', active: true },
    { icon: '●', label: 'New Session', path: '/createSession' },
    { icon: '→', label: 'Join Session', path: '/joinSession' },
  ];

  const libItems = [
    { icon: '◉', label: 'All Sessions', path: '/allSessions' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar loggedIn />
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh', paddingTop: 64 }}>

        {/* Sidebar */}
        <div style={{
          background: 'var(--surface)', borderRight: '1px solid var(--border)',
          padding: '2rem 0.75rem', position: 'sticky', top: 64,
          height: 'calc(100vh - 64px)', overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--tertiary)', padding: '0 0.75rem', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>NAVIGATION</div>
          {sideItems.map(item => (
            <button key={item.label} onClick={() => navigate(item.path)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              fontSize: '0.85rem', fontWeight: item.active ? 600 : 400,
              color: item.active ? 'var(--accent)' : 'var(--secondary)',
              background: item.active ? 'var(--accent-soft)' : 'transparent',
              border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
              fontFamily: 'var(--font)', marginBottom: 2, transition: 'background 0.2s',
            }}>
              <span style={{ fontSize: '0.7rem', fontFamily: 'var(--mono)', width: 16, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--tertiary)', padding: '0 0.75rem', margin: '1.5rem 0 0.5rem', letterSpacing: '0.06em' }}>LIBRARY</div>
          {libItems.map(item => (
            <button key={item.label} onClick={() => navigate(item.path)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              fontSize: '0.85rem', color: 'var(--secondary)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              width: '100%', textAlign: 'left', fontFamily: 'var(--font)',
              marginBottom: 2, transition: 'background 0.2s',
            }}>
              <span style={{ fontSize: '0.7rem', fontFamily: 'var(--mono)', width: 16, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div style={{ flex: 1 }} />
          <button onClick={() => { localStorage.removeItem('JWT'); navigate('/'); }} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10,
            fontSize: '0.85rem', color: 'var(--tertiary)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            width: '100%', textAlign: 'left', fontFamily: 'var(--font)',
          }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem' }}>⎋</span> Sign Out
          </button>
        </div>

        {/* Main */}
        <div style={{ padding: '2.5rem', overflowY: 'auto' }}>
          {/* Header */}
          <div className="anim-fadeUp" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Dashboard</h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>Manage your recording sessions.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate('/joinSession')} style={{
                padding: '10px 20px', borderRadius: 10, background: 'transparent',
                color: 'var(--text)', border: '1px solid var(--border)',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font)', transition: 'all 0.2s',
              }}>
                Join Session
              </button>
              <button onClick={() => navigate('/createSession')} style={{
                padding: '10px 20px', borderRadius: 10, background: 'var(--accent)',
                color: 'white', border: 'none', fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font)',
                boxShadow: '0 2px 12px rgba(255,55,95,0.25)',
              }}>
                + New Session
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="anim-fadeUp-1" style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem', marginBottom: '2rem',
          }}>
            {[
              { label: 'Total Sessions', val: loaded ? sessions.length.toString() : '—', accent: 'var(--accent)' },
              { label: 'Protocol', val: 'WebRTC', accent: 'var(--blue)' },
              { label: 'Recording', val: 'Local-first', accent: 'var(--amber)' },
              { label: 'Status', val: 'Active', accent: 'var(--green)' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '1.25rem',
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--tertiary)', fontWeight: 600, marginBottom: '0.5rem' }}>{s.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Sessions table */}
          <div className="anim-fadeUp-2" style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden', marginBottom: '2rem',
          }}>
            <div style={{
              padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '0.75rem',
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Recent Sessions</span>
              <input type="text" placeholder="Search..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: '8px 14px', background: 'var(--surface2)',
                  border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--text)', fontFamily: 'var(--font)',
                  fontSize: '0.8rem', outline: 'none', width: 200,
                }}
              />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface2)' }}>
                  {['Session', 'Code', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem',
                      fontWeight: 600, color: 'var(--tertiary)',
                      borderBottom: '1px solid var(--border)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => navigate('/recentSession', { state: { sessionId: s.id } })}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {s.sessionName.replace(/_[a-f0-9]{8}$/, '')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <code style={{
                        padding: '4px 10px', borderRadius: 6, background: 'var(--surface2)',
                        fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--secondary)',
                      }}>
                        {s.sessionCode.slice(0, 18)}...
                      </code>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>View →</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} style={{
                      padding: '3rem 2rem', textAlign: 'center', fontSize: '0.875rem',
                      color: 'var(--tertiary)',
                    }}>
                      {loaded ? 'No sessions yet — create your first recording.' : 'Loading...'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Quick actions */}
          <div className="anim-fadeUp-3" style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '0.75rem',
          }}>
            {[
              { icon: '●', label: 'New Recording', desc: 'Create a room and go live', path: '/createSession', primary: true },
              { icon: '→', label: 'Join as Guest', desc: 'Enter a session code', path: '/joinSession', primary: false },
              { icon: '◉', label: 'All Sessions', desc: 'Browse your full library', path: '/allSessions', primary: false },
            ].map(a => (
              <div key={a.label} onClick={() => navigate(a.path)} style={{
                background: 'var(--surface)', border: `1px solid ${a.primary ? 'rgba(255,55,95,0.2)' : 'var(--border)'}`,
                borderRadius: 12, padding: '1.5rem', cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex', alignItems: 'flex-start', gap: '1rem',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: a.primary ? 'var(--accent-soft)' : 'var(--surface2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', color: a.primary ? 'var(--accent)' : 'var(--secondary)',
                  fontFamily: 'var(--mono)', flexShrink: 0,
                }}>{a.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{a.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
