import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ loggedIn = false }: { loggedIn?: boolean }) {
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(1rem, 4vw, 3rem)',
      background: 'rgba(0, 0, 0, 0.72)',
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    }}>
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
        </div>
        <span style={{
          fontFamily: 'var(--font)', fontSize: '1.1rem', fontWeight: 700,
          letterSpacing: '-0.01em', color: 'var(--text)',
        }}>
          Podcastly
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {loggedIn ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/createSession">New Session</NavLink>
            <button
              onClick={() => { localStorage.removeItem('JWT'); navigate('/'); }}
              style={{
                padding: '7px 16px', borderRadius: 20, background: 'transparent',
                color: 'var(--secondary)', border: '1px solid var(--border)',
                fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font)',
                fontWeight: 500, transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--secondary)';
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Sign In</NavLink>
            <Link to="/signup" style={{
              padding: '7px 18px', borderRadius: 20,
              background: 'var(--accent)', color: 'white',
              fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
              fontFamily: 'var(--font)', transition: 'opacity 0.2s',
            }}>
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} style={{
      padding: '7px 14px', borderRadius: 20, fontSize: '0.8rem',
      color: 'var(--secondary)', textDecoration: 'none',
      fontFamily: 'var(--font)', fontWeight: 500, transition: 'color 0.2s',
    }}>
      {children}
    </Link>
  );
}
