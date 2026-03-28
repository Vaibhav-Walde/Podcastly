import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import Navbar from '../components/Navbar';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('All fields required'); return; }
    setLoading(true); setError('');
    try {
      const res = await login(email, password);
      localStorage.setItem('JWT', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.msg || 'Invalid credentials');
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '13px 16px', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      <Navbar />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', paddingTop: 68 }}>

        {/* Left — Form */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse 80% 60% at 0% 50%, rgba(255,45,59,0.05), transparent)', pointerEvents: 'none' }} />
          <div className="anim-fadeUp" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '3rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', letterSpacing: '0.06em' }}>PODCASTLY</span>
            </Link>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.14em', color: 'var(--red)', marginBottom: '0.75rem' }}>// RETURNING CREATOR</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', letterSpacing: '0.04em', lineHeight: 0.95, marginBottom: '0.5rem' }}>SIGN<br />BACK IN</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '2.5rem', fontWeight: 300 }}>Access your dashboard and recordings.</p>

            {error && (
              <div style={{ background: 'rgba(255,45,59,0.08)', border: '1px solid rgba(255,45,59,0.3)', borderRadius: 6, padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--red)', letterSpacing: '0.06em', marginBottom: '1.5rem' }}>
                ⚠ {error.toUpperCase()}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--dim)', display: 'block', marginBottom: 6 }}>EMAIL ADDRESS</label>
                <input type="email" style={inp} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,45,59,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border2)'} />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--dim)', display: 'block', marginBottom: 6 }}>PASSWORD</label>
                <input type="password" style={inp} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,45,59,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border2)'} />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? 'var(--red2)' : 'var(--red)', color: 'white', border: 'none', borderRadius: 6, cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.1em', boxShadow: loading ? 'none' : '0 0 24px rgba(255,45,59,0.3)' }}>
                {loading ? 'AUTHENTICATING...' : 'ENTER STUDIO →'}
              </button>
            </form>

            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--muted)' }}>
              New here?{' '}
              <Link to="/signup" style={{ color: 'var(--red)', textDecoration: 'none', fontWeight: 500 }}>Create account</Link>
            </p>
          </div>
        </div>

        {/* Right — Visual */}
        <div style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: '40%', background: 'radial-gradient(ellipse at 50% 100%, rgba(255,45,59,0.12), transparent)', pointerEvents: 'none' }} />
          <div className="anim-fadeUp-2" style={{ position: 'relative', zIndex: 1, maxWidth: 380, width: '100%' }}>
            {/* Quote card */}
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 12, padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'var(--red)', marginBottom: '1rem' }}>// USER TESTIMONIAL</div>
              <p style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: 1.7, fontWeight: 300, fontStyle: 'italic', marginBottom: '1.5rem' }}>
                "Podcastly changed everything. My interviews sound like they were recorded in a real studio — even when my guest is across the world."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,45,59,0.12)', border: '1px solid rgba(255,45,59,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--red)' }}>MR</div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Maya Rodriguez</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.08em', color: 'var(--dim)' }}>HOST, THE INDIE STACK PODCAST</div>
                </div>
              </div>
            </div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {[['48K+','CREATORS'],['2.1M','EPISODES'],['99.9%','UPTIME']].map(([n,l]) => (
                <div key={l} style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 8, padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.04em', color: 'var(--text)' }}>{n}</div>
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
