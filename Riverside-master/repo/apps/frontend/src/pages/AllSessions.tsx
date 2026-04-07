import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllSessions } from '../api/api';
import type { SessionType } from '../types';
import Navbar from '../components/Navbar';

export default function AllSessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAllSessions()
      .then(r => { setSessions(r.data.sessions || []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const filtered = sessions.filter(s =>
    s.sessionName.toLowerCase().includes(search.toLowerCase()) ||
    s.sessionCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar loggedIn />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '120px 2rem 4rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none', border: 'none', color: 'var(--secondary)',
            cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.875rem',
            marginBottom: '2rem', padding: 0, display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ← Back to Dashboard
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font)', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>All Sessions</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>
              {loaded ? `${sessions.length} sessions total` : 'Loading...'}
            </p>
          </div>
          <input
            type="text" placeholder="Search sessions..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              padding: '10px 16px', background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '0.875rem',
              outline: 'none', width: 260, transition: 'border-color 0.2s',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />
        </div>

        {!loaded && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}

        {loaded && filtered.length === 0 && (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '4rem 2rem', textAlign: 'center',
          }}>
            <p style={{ fontSize: '1rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>No sessions found</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--tertiary)' }}>
              {search ? 'Try a different search term' : 'Create your first session to get started'}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtered.map((s, i) => (
            <div
              key={s.id}
              onClick={() => navigate('/recentSession', { state: { sessionId: s.id } })}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.background = 'var(--surface2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--surface)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: i === 0 ? 'rgba(255,55,95,0.12)' : 'var(--surface2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontFamily: 'var(--mono)', color: i === 0 ? 'var(--accent)' : 'var(--tertiary)',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {s.sessionName.replace(/_[a-f0-9]{8}$/, '')}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--tertiary)', marginTop: 2 }}>
                    {s.sessionCode.slice(0, 18)}...
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>View →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
