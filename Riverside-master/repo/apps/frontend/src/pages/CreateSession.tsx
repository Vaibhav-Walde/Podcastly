// CreateSession.tsx
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
    if (!sessionName.trim()) { setError('Session name required'); return; }
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
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      <Navbar loggedIn />
      <div style={{ minHeight: '100vh', paddingTop: 68, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 2rem 3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,45,59,0.06), transparent)', pointerEvents: 'none' }} />
        <div className="anim-fadeUp" style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '3rem', width: '100%', maxWidth: 560, position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--red)', borderRadius: '16px 16px 0 0' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.14em', color: 'var(--red)', marginBottom: '1rem' }}>// NEW BROADCAST</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', letterSpacing: '0.04em', lineHeight: 0.95, marginBottom: '0.5rem' }}>CREATE<br />SESSION</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '2.5rem', fontWeight: 300 }}>Set up your studio. Guests will join via the session code generated after creation.</p>

          {error && <div style={{ background: 'rgba(255,45,59,0.08)', border: '1px solid rgba(255,45,59,0.3)', borderRadius: 6, padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--red)', letterSpacing: '0.06em', marginBottom: '1.5rem' }}>⚠ {error.toUpperCase()}</div>}

          <form onSubmit={handleSubmit}>
            {[
              { label: 'SESSION NAME', type: 'text', val: sessionName, set: setSessionName, ph: 'e.g. Tech Trends Ep. 14' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--dim)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} style={{ width: '100%', padding: '13px 16px', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' }} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,45,59,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border2)'} />
              </div>
            ))}
            {[
              { label: 'RECORDING QUALITY', opts: ['1080p HD (Recommended)', '720p', '4K Ultra'] },
              { label: 'MAX PARTICIPANTS', opts: ['2 participants', '5 participants', '8 participants'] },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--dim)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <select style={{ width: '100%', padding: '13px 16px', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.1em', marginTop: '1.5rem', boxShadow: '0 0 24px rgba(255,45,59,0.3)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'LAUNCHING...' : '⏺ LAUNCH SESSION →'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '13px', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.08em', marginTop: '0.75rem' }}>
              ← BACK TO DASHBOARD
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
