import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinSession } from '../api/api';
import Navbar from '../components/Navbar';

export default function JoinSession() {
  const navigate = useNavigate();
  const [sessionCode, setSessionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionCode.trim()) { setError('Session code required'); return; }
    setLoading(true);
    try {
      const res = await joinSession(sessionCode);
      const sessionId = res.data.sessionId;
      navigate('/nreceiver', { state: { sessionCode, sessionId } });
    } catch (err: any) {
      setError(err?.response?.data?.msg || 'Invalid session code');
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      <Navbar loggedIn />
      <div style={{ minHeight: '100vh', paddingTop: 68, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 2rem 3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,45,59,0.06), transparent)', pointerEvents: 'none' }} />
        <div className="anim-fadeUp" style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: '3rem', width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--amber), var(--red))', borderRadius: '16px 16px 0 0' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.14em', color: 'var(--amber)', marginBottom: '1rem' }}>// JOIN BROADCAST</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', letterSpacing: '0.04em', lineHeight: 0.95, marginBottom: '0.5rem' }}>JOIN A<br />SESSION</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '2.5rem', fontWeight: 300 }}>Enter the session code your host shared with you to join the recording room.</p>

          {error && <div style={{ background: 'rgba(255,45,59,0.08)', border: '1px solid rgba(255,45,59,0.3)', borderRadius: 6, padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--red)', letterSpacing: '0.06em', marginBottom: '1.5rem' }}>⚠ {error.toUpperCase()}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--dim)', display: 'block', marginBottom: 6 }}>SESSION CODE</label>
              <input type="text" style={{ width: '100%', padding: '16px', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.15em', textTransform: 'uppercase', outline: 'none', textAlign: 'center' }}
                placeholder="XXXX-XXXX" value={sessionCode} onChange={e => setSessionCode(e.target.value)}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,45,59,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border2)'} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.1em', boxShadow: '0 0 24px rgba(255,45,59,0.3)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'CONNECTING...' : '→ JOIN STUDIO'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '13px', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.08em', marginTop: '0.75rem' }}>
              ← BACK
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
