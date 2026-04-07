import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';

// Subtle mouse-tracking gradient
function AmbientGlow() {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
      background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, rgba(255,55,95,0.04), transparent 60%)`,
      transition: 'background 0.4s ease',
    }} />
  );
}

// Animated waveform bars
function Waveform({ color = 'var(--accent)', bars = 12, active = true }: { color?: string; bars?: number; active?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 24 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 2, borderRadius: 1, background: color, opacity: 0.8,
          animation: active ? `wave ${0.4 + (i % 5) * 0.15}s ease-in-out infinite alternate` : 'none',
          height: active ? undefined : 4,
          animationDelay: `${i * 0.05}s`,
        }} />
      ))}
    </div>
  );
}

// Scrolling ticker
function Ticker() {
  const items = ['Studio-quality recording', 'WebRTC peer-to-peer', 'Local-first capture', 'Cloud backup', 'Separate audio tracks', 'Real-time signaling', 'Zero quality loss'];
  return (
    <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', overflow: 'hidden', padding: '14px 0' }}>
      <div style={{ display: 'flex', animation: 'ticker 40s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--secondary)', padding: '0 2.5rem', letterSpacing: '0.02em' }}>
            {item} <span style={{ opacity: 0.3, margin: '0 0.5rem' }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const features = [
  { icon: '🎙', title: 'Local-first Recording', desc: 'Audio & video captured directly on your device. Internet drops? Your recording stays perfect.' },
  { icon: '⚡', title: 'WebRTC Engine', desc: 'Sub-50ms peer-to-peer connections. No middleman servers, no latency, no quality loss.' },
  { icon: '☁️', title: 'Cloud Backup', desc: 'Chunks upload in real-time as you record. Your work is always safely backed up.' },
  { icon: '🔀', title: 'Separate Tracks', desc: 'Each participant recorded independently for maximum post-production flexibility.' },
  { icon: '🎬', title: 'HD Quality', desc: 'Full resolution video capture. Your content deserves studio-grade quality.' },
  { icon: '🔒', title: 'Secure Sessions', desc: 'Unique session codes ensure only invited guests can join your recording room.' },
];

const steps = [
  { num: '01', title: 'Create a session', desc: 'Start a new recording room and get a unique invite code to share.' },
  { num: '02', title: 'Invite your guest', desc: 'Share the code. They join from any browser — no downloads needed.' },
  { num: '03', title: 'Start the call', desc: 'WebRTC establishes a direct peer-to-peer connection in milliseconds.' },
  { num: '04', title: 'Record & export', desc: 'Each track is captured locally and backed up to the cloud automatically.' },
];

const techStack = [
  { name: 'WebRTC', role: 'P2P Streaming', accent: 'var(--accent)' },
  { name: 'React', role: 'Frontend', accent: 'var(--blue)' },
  { name: 'Node.js', role: 'Backend API', accent: 'var(--green)' },
  { name: 'WebSocket', role: 'Signaling', accent: 'var(--amber)' },
  { name: 'PostgreSQL', role: 'Database', accent: 'var(--accent)' },
  { name: 'Supabase', role: 'Storage', accent: 'var(--green)' },
  { name: 'Prisma', role: 'ORM', accent: 'var(--blue)' },
  { name: 'BullMQ', role: 'Job Queue', accent: 'var(--amber)' },
];

const faqs = [
  { q: 'Do guests need to create an account?', a: 'Guests need a free account to join sessions. It takes 10 seconds to sign up — no credit card required.' },
  { q: 'What happens if the internet drops?', a: 'Since recording is local-first, your audio and video keep recording on-device even if the live connection drops temporarily.' },
  { q: 'What browsers are supported?', a: 'Any modern browser with WebRTC support: Chrome, Firefox, Safari, and Edge. Mobile browsers work too.' },
  { q: 'Is my data private?', a: 'Sessions are protected by unique codes. Recordings are stored securely in your personal cloud storage.' },
  { q: 'How many participants per session?', a: 'Currently supports 1 host + 1 guest per session. Multi-guest support is coming soon.' },
];

export default function Landing() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <AmbientGlow />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '140px 2rem 80px', position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <div className="anim-fadeUp" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem',
            padding: '6px 16px', borderRadius: 20,
            background: 'var(--accent-soft)', border: '1px solid rgba(255,55,95,0.2)',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.03em' }}>Now in public beta</span>
          </div>

          {/* Headline */}
          <h1 className="anim-fadeUp-1" style={{
            fontFamily: 'var(--font)', fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05,
            textAlign: 'center', marginBottom: '1.25rem',
            background: 'linear-gradient(to bottom, var(--text) 0%, var(--secondary) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Record studio-quality<br />podcasts, remotely.
          </h1>

          <p className="anim-fadeUp-2" style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--secondary)',
            maxWidth: 520, textAlign: 'center', lineHeight: 1.7, marginBottom: '2.5rem',
          }}>
            WebRTC peer-to-peer streaming with local-first recording.
            Each track captured independently for perfect quality — every time.
          </p>

          {/* CTA */}
          <div className="anim-fadeUp-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: '5rem' }}>
            <Link to="/signup" style={{
              padding: '14px 32px', background: 'var(--accent)', color: 'white',
              borderRadius: 12, textDecoration: 'none', fontWeight: 600,
              fontSize: '0.95rem', transition: 'all 0.3s var(--ease)',
              boxShadow: '0 4px 24px rgba(255,55,95,0.3)',
            }}>
              Start recording — it's free
            </Link>
            <Link to="/login" style={{
              padding: '14px 32px', background: 'transparent', color: 'var(--text)',
              borderRadius: 12, textDecoration: 'none', fontWeight: 600,
              fontSize: '0.95rem', border: '1px solid var(--border)',
              transition: 'all 0.3s var(--ease)',
            }}>
              Sign in →
            </Link>
          </div>

          {/* Studio mockup */}
          <div className="anim-fadeUp-4" style={{
            width: '100%', maxWidth: 820,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}>
            {/* Window bar */}
            <div style={{
              background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
              padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--tertiary)', marginLeft: 8 }}>podcastly.app — Recording Studio</span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '3px 10px', borderRadius: 12,
                background: 'rgba(255,55,95,0.1)', border: '1px solid rgba(255,55,95,0.2)',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)' }}>Recording · 00:14:32</span>
              </div>
            </div>

            {/* Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', height: 200 }}>
              {/* Video area */}
              <div style={{ background: '#0a0a0a', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: 10 }}>
                {[
                  { init: 'VK', name: 'Vaibhav K.', active: true },
                  { init: 'SJ', name: 'Sara J.', active: false },
                ].map(p => (
                  <div key={p.init} style={{
                    background: p.active ? 'rgba(255,55,95,0.06)' : 'var(--surface)',
                    border: `1px solid ${p.active ? 'rgba(255,55,95,0.3)' : 'var(--border)'}`,
                    borderRadius: 10, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: p.active ? 'var(--accent)' : 'var(--surface3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700, color: 'white',
                    }}>{p.init}</div>
                    <span style={{ fontSize: '0.7rem', color: p.active ? 'var(--text)' : 'var(--tertiary)', fontWeight: 500 }}>{p.name}</span>
                    <Waveform bars={8} active={p.active} color={p.active ? 'var(--accent)' : 'rgba(255,255,255,0.15)'} />
                  </div>
                ))}
              </div>
              {/* Panel */}
              <div style={{ background: 'var(--surface2)', borderLeft: '1px solid var(--border)', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--tertiary)', fontWeight: 600 }}>Session Info</div>
                <div style={{
                  padding: '6px 8px', background: 'var(--surface3)', borderRadius: 6,
                  fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text)',
                }}>a3f9-bc12-7e04</div>
                {[['Protocol', 'WebRTC P2P'], ['Status', '● Recording'], ['Quality', '1080p']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                    <span style={{ color: 'var(--tertiary)' }}>{k}</span>
                    <span style={{ color: v.startsWith('●') ? 'var(--accent)' : 'var(--text)', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Control bar */}
            <div style={{
              background: 'var(--surface)', borderTop: '1px solid var(--border)',
              padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Waveform bars={14} active />
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {['🎙', '📹'].map((icon, i) => (
                  <div key={i} style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
                  }}>{icon}</div>
                ))}
                <div style={{
                  padding: '6px 14px', background: 'var(--accent-soft)',
                  color: 'var(--accent)', border: '1px solid rgba(255,55,95,0.3)',
                  borderRadius: 8, fontSize: '0.7rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: 'var(--accent)' }} /> Stop
                </div>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>00:14:32</span>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'fadeIn 1s 1.5s both' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--tertiary)', fontWeight: 500 }}>Scroll to explore</span>
            <div style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, var(--tertiary), transparent)' }} />
          </div>
        </div>
      </section>

      <Ticker />

      {/* ── FEATURES ── */}
      <section style={{ padding: '120px 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <p className="anim-fadeUp" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Features</p>
          <h2 className="anim-fadeUp-1" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Built for creators<br />who care about quality.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'var(--surface)', padding: '2.25rem', transition: 'background 0.3s',
              cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{f.icon}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>{f.title}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--secondary)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '100px 2rem', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--amber)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Four steps to<br />studio-quality audio.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
            {steps.map((step, i) => (
              <div key={i}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'rgba(255,55,95,0.1)', lineHeight: 1, marginBottom: '1rem', letterSpacing: '-0.02em' }}>{step.num}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{step.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--secondary)', lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section style={{ padding: '120px 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--blue)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Under the hood</p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Modern tech stack.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {techStack.map((tech, i) => (
            <div key={i} style={{
              background: 'var(--surface)', padding: '1.5rem', transition: 'background 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: tech.accent, marginBottom: '0.75rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{tech.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--tertiary)', fontWeight: 500, marginTop: 4 }}>{tech.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '100px 2rem', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>FAQ</p>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Common questions.</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {faqs.map((faq, i) => (
              <div key={i}
                style={{
                  background: activeFaq === i ? 'var(--surface2)' : 'var(--surface)',
                  cursor: 'pointer', transition: 'background 0.2s',
                }}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div style={{
                  padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: '1rem',
                }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: activeFaq === i ? 'var(--text)' : 'var(--secondary)' }}>{faq.q}</span>
                  <span style={{
                    fontSize: '1rem', color: activeFaq === i ? 'var(--accent)' : 'var(--tertiary)',
                    transition: 'transform 0.2s', transform: activeFaq === i ? 'rotate(45deg)' : 'none',
                    flexShrink: 0,
                  }}>+</span>
                </div>
                <div style={{
                  maxHeight: activeFaq === i ? 200 : 0, overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                }}>
                  <div style={{ padding: '0 1.25rem 1.1rem', fontSize: '0.875rem', color: 'var(--secondary)', lineHeight: 1.7 }}>{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '140px 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,55,95,0.06), transparent)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 700, letterSpacing: '-0.03em',
            lineHeight: 1.1, marginBottom: '1.5rem',
          }}>
            Ready to record?
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Free to start. No credit card required.<br />Studio-quality from day one.
          </p>
          <Link to="/signup" style={{
            padding: '16px 40px', background: 'var(--accent)', color: 'white',
            borderRadius: 14, textDecoration: 'none', fontWeight: 700,
            fontSize: '1.05rem', display: 'inline-block',
            boxShadow: '0 4px 32px rgba(255,55,95,0.35)',
            transition: 'transform 0.2s var(--ease), box-shadow 0.2s',
          }}>
            Create free account →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Podcastly</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--tertiary)' }}>Built with WebRTC · React · Node.js</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--tertiary)' }}>© 2025 Podcastly</span>
      </footer>
    </div>
  );
}
