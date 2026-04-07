import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../api/api';
import Navbar from '../components/Navbar';

export default function CreateSession() {
  const navigate = useNavigate();
  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionName.trim()) { setError('Session name is required'); return; }
    setLoading(true);
    try {
      const res = await createSession(sessionName);
      const { sessionCode, sessionid: id } = res.data;
      navigate('/nsender', { state: { sessionCode, sessionid: id } });
    } catch (err: any) {
      setError(err?.response?.data?.msg || 'Failed to create session');
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar loggedIn />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 2rem 3rem' }}>
        <div className="anim-fadeUp" style={{ width: '100%', maxWidth: 460 }}>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Create a session
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '2rem' }}>
            Set up your studio. Guests join via the session code generated after creation.
          </p>

          {error && (
            <div style={{
              background: 'rgba(255,55,95,0.08)', border: '1px solid rgba(255,55,95,0.2)',
              borderRadius: 10, padding: '12px 16px', fontSize: '0.8rem',
              color: 'var(--accent)', marginBottom: '1.5rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)', display: 'block', marginBottom: 6 }}>Session name</label>
              <input type="text" placeholder="e.g. Tech Trends Ep. 14"
                value={sessionName} onChange={e => setSessionName(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)',
                  fontFamily: 'var(--font)', fontSize: '0.9rem', outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,55,95,0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', background: 'var(--accent)', color: 'white',
              border: 'none', borderRadius: 12, cursor: loading ? 'wait' : 'pointer',
              fontFamily: 'var(--font)', fontSize: '0.95rem', fontWeight: 600,
              transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1,
              marginTop: '0.5rem',
            }}>
              {loading ? 'Creating...' : 'Launch Session'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} style={{
              width: '100%', padding: '13px', background: 'transparent',
              color: 'var(--secondary)', border: '1px solid var(--border)',
              borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--font)',
              fontSize: '0.85rem', fontWeight: 500, marginTop: '0.5rem',
            }}>
              ← Back to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
