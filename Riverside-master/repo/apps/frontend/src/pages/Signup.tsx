import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp, login } from '../api/api';
import Navbar from '../components/Navbar';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) { setError('All fields required'); return; }
    setLoading(true); setError('');
    try {
      await signUp(name, email, password);
      // Auto-login after signup
      const loginRes = await login(email, password);
      localStorage.setItem('JWT', loginRes.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(String(err?.response?.data?.msg || 'Something went wrong'));
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '13px 16px', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' };
  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = 'rgba(255,45,59,0.5)';
  const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = 'var(--border2)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      <Navbar />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', paddingTop: 68 }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 0% 50%, rgba(255,45,59,0.05), transparent)', pointerEvents: 'none' }} />
          <div className="anim-fadeUp" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '3rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', letterSpacing: '0.06em' }}>PODCASTLY</span>
            </Link>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.14em', color: 'var(--red)', marginBottom: '0.75rem' }}>// NEW CREATOR</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', letterSpacing: '0.04em', lineHeight: 0.95, marginBottom: '0.5rem' }}>JOIN THE<br />STUDIO</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '2.5rem', fontWeight: 300 }}>Start recording studio-quality podcasts in minutes.</p>

            {error && (
              <div style={{ background: 'rgba(255,45,59,0.08)', border: '1px solid rgba(255,45,59,0.3)', borderRadius: 6, padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--red)', letterSpacing: '0.06em', marginBottom: '1.5rem' }}>
                ⚠ {error.toUpperCase()}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {[
                { label: 'FULL NAME', type: 'text', val: name, set: setName, ph: 'Vaibhav Kumar' },
                { label: 'EMAIL ADDRESS', type: 'email', val: email, set: setEmail, ph: 'you@example.com' },
                { label: 'PASSWORD', type: 'password', val: password, set: setPassword, ph: 'Min. 8 characters' },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: '1rem' }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--dim)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} style={inp} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
                </div>
              ))}
              <div style={{ height: '1rem' }} />
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? 'var(--red2)' : 'var(--red)', color: 'white', border: 'none', borderRadius: 6, cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.1em', boxShadow: loading ? 'none' : '0 0 24px rgba(255,45,59,0.3)' }}>
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
              </button>
            </form>
            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--muted)' }}>
              Already a creator?{' '}
              <Link to="/login" style={{ color: 'var(--red)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            </p>
          </div>
        </div>

        {/* Right */}
        <div style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
          <div className="anim-fadeUp-2" style={{ position: 'relative', zIndex: 1, maxWidth: 380, width: '100%' }}>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'var(--amber)', marginBottom: '1rem' }}>// WHY PODCASTLY</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  ['LOCAL RECORDING', 'Device-level capture means zero internet quality loss. Ever.'],
                  ['WEBRTC ENGINE', 'Sub-50ms peer-to-peer connections. Real broadcast feel.'],
                  ['CLOUD BACKUP', 'Chunks upload live. Recordings saved securely in the cloud.'],
                ].map(([title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', marginTop: 6, flexShrink: 0, animation: 'pulse 2s ease-in-out infinite' }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 300 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {[['4K','VIDEO'],['FREE','TO START'],['LOCAL','FIRST']].map(([n,l]) => (
                <div key={l} style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.04em' }}>{n}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.1em', color: 'var(--dim)', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
