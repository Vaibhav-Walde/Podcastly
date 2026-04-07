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
    if (!name || !email || !password) { setError('All fields are required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', background: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)',
    fontFamily: 'var(--font)', fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const fields = [
    { label: 'Full name', type: 'text', val: name, set: setName, ph: 'Vaibhav Walde' },
    { label: 'Email', type: 'email', val: email, set: setEmail, ph: 'you@example.com' },
    { label: 'Password', type: 'password', val: password, set: setPassword, ph: '6+ characters' },
  ];

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
            Create your account
          </h1>
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--secondary)', marginBottom: '2rem' }}>
            Start recording studio-quality podcasts in minutes.
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
            {fields.map(f => (
              <div key={f.label} style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} style={inputStyle} placeholder={f.ph}
                  value={f.val} onChange={e => f.set(e.target.value)}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,55,95,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            ))}
            <div style={{ height: '0.75rem' }} />
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', background: 'var(--accent)', color: 'white',
              border: 'none', borderRadius: 12, cursor: loading ? 'wait' : 'pointer',
              fontFamily: 'var(--font)', fontSize: '0.95rem', fontWeight: 600,
              transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
