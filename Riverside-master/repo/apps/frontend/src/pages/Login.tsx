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
    if (!email || !password) { setError('All fields are required'); return; }
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)',
    fontFamily: 'var(--font)', fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 2rem 3rem',
      }}>
        <div className="anim-fadeUp" style={{ width: '100%', maxWidth: 400 }}>
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'white' }} />
            </div>
          </div>

          <h1 style={{
            fontFamily: 'var(--font)', fontSize: '1.75rem', fontWeight: 700,
            textAlign: 'center', letterSpacing: '-0.02em', marginBottom: '0.5rem',
          }}>
            Sign in to Podcastly
          </h1>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '2rem' }}>
            Access your dashboard and recordings.
          </p>

          {error && (
            <div style={{
              background: 'rgba(255,55,95,0.08)', border: '1px solid rgba(255,55,95,0.2)',
              borderRadius: 10, padding: '12px 16px', fontSize: '0.8rem',
              color: 'var(--accent)', marginBottom: '1.5rem', textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" style={inputStyle} placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,55,95,0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" style={inputStyle} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,55,95,0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', background: 'var(--accent)', color: 'white',
              border: 'none', borderRadius: 12, cursor: loading ? 'wait' : 'pointer',
              fontFamily: 'var(--font)', fontSize: '0.95rem', fontWeight: 600,
              transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
