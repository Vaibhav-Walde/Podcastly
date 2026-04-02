import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';

function Waveform({ color = 'var(--red)', bars = 12, active = true }: { color?: string; bars?: number; active?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 36 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2, background: color,
          animation: active ? `wave ${0.5 + (i % 4) * 0.2}s ease-in-out infinite alternate` : 'none',
          height: active ? undefined : 5,
          animationDelay: `${i * 0.06}s`,
        }} />
      ))}
    </div>
  );
}

function Ticker() {
  const items = ['STUDIO-QUALITY RECORDING', 'WEBRTC PEER-TO-PEER', 'LOCAL-FIRST CAPTURE', 'SUPABASE CLOUD BACKUP', 'BULLMQ PROCESSING', 'ZERO QUALITY LOSS', 'SEPARATE AUDIO TRACKS', 'REAL-TIME SIGNALING'];
  return (
    <div style={{ background: 'var(--red)', overflow: 'hidden', padding: '7px 0', position: 'relative' }}>
      <div style={{ display: 'flex', animation: 'ticker 30s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.12em', color: 'white', padding: '0 2.5rem', opacity: 0.9 }}>
            {item} <span style={{ opacity: 0.5 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function StudioClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>
      {pad(time.getHours())}:{pad(time.getMinutes())}:{pad(time.getSeconds())}
    </div>
  );
}

// 3D floating orbs background
function FloatingOrbs() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {[
        { size: 600, x: '60%', y: '20%', color: 'rgba(255,45,59,0.08)', delay: '0s', duration: '8s' },
        { size: 400, x: '10%', y: '60%', color: 'rgba(255,170,0,0.04)', delay: '2s', duration: '12s' },
        { size: 300, x: '80%', y: '70%', color: 'rgba(0,212,255,0.04)', delay: '4s', duration: '10s' },
      ].map((orb, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: orb.size, height: orb.size,
          left: orb.x, top: orb.y,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
          animation: `orbFloat ${orb.duration} ${orb.delay} ease-in-out infinite alternate`,
          borderRadius: '50%',
        }} />
      ))}
    </div>
  );
}

// Mouse-tracking gradient
function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return (
    <div ref={ref} style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
      background: `radial-gradient(800px circle at ${pos.x}% ${pos.y}%, rgba(255,45,59,0.06), transparent 60%)`,
      transition: 'background 0.3s ease',
    }} />
  );
}

const features = [
  { icon: '🎙', title: 'LOCAL-FIRST', sub: 'Recording', desc: 'Audio & video captured directly on-device. Internet drops? Your recording stays perfect.' },
  { icon: '⚡', title: 'WEBRTC', sub: 'Engine', desc: 'Sub-50ms peer-to-peer connections. No middleman, no latency, no quality loss.' },
  { icon: '☁', title: 'CLOUD', sub: 'Backup', desc: 'Recordings upload chunk-by-chunk as you record. Never lose a take again.' },
  { icon: '🔀', title: 'SEPARATE', sub: 'Tracks', desc: 'Each participant recorded independently for maximum post-production control.' },
  { icon: '🎬', title: '4K', sub: 'Quality', desc: 'Full resolution video capture. Your content deserves the highest quality.' },
  { icon: '🔒', title: 'SECURE', sub: 'Sessions', desc: 'Unique session codes. Only invited guests can join your recording room.' },
];

const steps = [
  { num: '01', title: 'CREATE SESSION', desc: 'Start a new recording session and get a unique code to share with your guests.' },
  { num: '02', title: 'INVITE GUESTS', desc: 'Share the session code. Guests join from any browser — no downloads needed.' },
  { num: '03', title: 'GO LIVE', desc: 'Click Start Call. WebRTC establishes a direct peer-to-peer connection instantly.' },
  { num: '04', title: 'RECORD & EXPORT', desc: 'Hit record. Each track is captured locally and backed up to the cloud automatically.' },
];

const faqs = [
  { q: 'Do guests need to create an account?', a: 'No! Guests only need the session code. Only the host needs an account to create sessions.' },
  { q: 'What happens if the internet drops during recording?', a: 'Since recording is local-first, your audio and video keep recording on-device. Only the live stream drops temporarily.' },
  { q: 'What browsers are supported?', a: 'Any modern browser that supports WebRTC: Chrome, Firefox, Safari, Edge. Mobile browsers work too.' },
  { q: 'Is my data private?', a: 'Sessions are protected by unique codes. Recordings are stored securely in your personal cloud storage.' },
  { q: 'How many participants can join?', a: 'Currently supports up to 8 participants per session. Each gets their own separate track.' },
];

export default function Landing() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', overflowX: 'hidden' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <FloatingOrbs />
        <MouseGlow />

        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 2rem 80px', position: 'relative', zIndex: 1 }}>

          {/* Top badge */}
          <div className="anim-fadeUp" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem', padding: '6px 16px', borderRadius: 100, border: '1px solid var(--border2)', background: 'rgba(255,45,59,0.05)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'blink 1s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'var(--muted)' }}>STUDIO-QUALITY REMOTE RECORDING</span>
          </div>

          {/* Studio clock */}
          <div className="anim-fadeUp" style={{ marginBottom: '1.5rem' }}><StudioClock /></div>

          {/* Main headline */}
          <h1 className="anim-fadeUp-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(4rem, 12vw, 10rem)', letterSpacing: '0.02em', lineHeight: 0.88, textAlign: 'center', marginBottom: '1.5rem', position: 'relative' }}>
            <span style={{ display: 'block', color: 'var(--text)' }}>RECORD</span>
            <span style={{ display: 'block', color: 'var(--red)', textShadow: '0 0 60px rgba(255,45,59,0.4)', position: 'relative' }}>
              STUDIO
              <span style={{ position: 'absolute', inset: 0, color: 'rgba(255,45,59,0.15)', transform: 'translate(3px, 3px)', zIndex: -1, animation: 'glitch 4s ease-in-out infinite 2s' }}>STUDIO</span>
            </span>
            <span style={{ display: 'block', color: 'var(--text)' }}>QUALITY</span>
          </h1>

          <p className="anim-fadeUp-2" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--muted)', maxWidth: 560, textAlign: 'center', lineHeight: 1.6, marginBottom: '3rem', fontWeight: 300 }}>
            Riverside-quality podcast recording. WebRTC peer-to-peer streams. Local-first capture. No compromises.
          </p>

          {/* CTA buttons */}
          <div className="anim-fadeUp-3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: '4rem' }}>
            <Link to="/signup" style={{ padding: '14px 36px', background: 'var(--red)', color: 'white', borderRadius: 8, textDecoration: 'none', fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.1em', boxShadow: '0 0 40px rgba(255,45,59,0.3)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', animation: 'blink 1s ease-in-out infinite' }} />
              START RECORDING FREE
            </Link>
            <Link to="/login" style={{ padding: '14px 36px', background: 'transparent', color: 'var(--text)', borderRadius: 8, textDecoration: 'none', fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.1em', border: '1px solid var(--border2)', transition: 'all 0.2s' }}>
              SIGN IN →
            </Link>
          </div>

          {/* Hero studio mockup */}
          <div className="anim-fadeUp-4" style={{ width: '100%', maxWidth: 860, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)', position: 'relative' }}>
            {/* Red recording border */}
            <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(255,45,59,0.3)', borderRadius: 16, pointerEvents: 'none', animation: 'borderGlow 3s ease-in-out infinite' }} />

            {/* Mockup topbar */}
            <div style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--dim)', letterSpacing: '0.06em' }}>podcastly.app/nsender</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 10px', borderRadius: 100, background: 'rgba(255,45,59,0.12)', border: '1px solid rgba(255,45,59,0.4)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'blink 1s ease-in-out infinite' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--red)' }}>ON AIR · 00:14:32</span>
              </div>
            </div>

            {/* Mockup content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', height: 220 }}>
              {/* Video area */}
              <div style={{ background: '#080808', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px)' }} />
                {/* Fake participant cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 12, width: '100%' }}>
                  {[
                    { init: 'VK', name: 'Vaibhav K.', active: true },
                    { init: 'SJ', name: 'Sara J.', active: false },
                  ].map(p => (
                    <div key={p.init} style={{ background: p.active ? 'rgba(255,45,59,0.08)' : 'var(--surface)', border: `1px solid ${p.active ? 'rgba(255,45,59,0.5)' : 'var(--border)'}`, borderRadius: 8, padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, boxShadow: p.active ? '0 0 20px rgba(255,45,59,0.15)' : 'none' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: p.active ? 'var(--red)' : 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'white' }}>{p.init}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: p.active ? 'var(--text)' : 'var(--dim)', letterSpacing: '0.04em' }}>{p.name}</div>
                      <Waveform bars={8} active={p.active} color={p.active ? 'var(--red)' : 'rgba(255,255,255,0.2)'} />
                    </div>
                  ))}
                </div>
              </div>
              {/* Right panel */}
              <div style={{ background: 'var(--surface2)', borderLeft: '1px solid var(--border)', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--dim)', letterSpacing: '0.1em' }}>// SESSION CODE</div>
                <div style={{ padding: '6px 8px', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 5, fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.08em', color: 'var(--text)' }}>a3f9-bc12-7e04</div>
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                {[['PROTOCOL','WebRTC P2P'],['STATUS','● RECORDING'],['QUALITY','1080P'],['STORAGE','Supabase']].map(([k,v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--dim)' }}>{k}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: v.startsWith('●') ? 'var(--red)' : 'var(--text)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Control bar */}
            <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Waveform bars={16} active={true} />
              <div style={{ display: 'flex', gap: 8 }}>
                {['🎙','📹'].map((icon,i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface3)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>{icon}</div>
                ))}
                <div style={{ padding: '6px 16px', background: 'var(--surface3)', color: 'var(--red)', border: '1px solid rgba(255,45,59,0.4)', borderRadius: 6, fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--red)' }} /> STOP REC
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--red)', letterSpacing: '0.06em' }}>00:14:32</div>
            </div>
          </div>

          {/* Stats row */}
          <div className="anim-fadeUp-5" style={{ display: 'flex', gap: '3rem', marginTop: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[['WebRTC','P2P Engine'],['Local-First','Recording'],['4K','Quality'],['Free','To Start']].map(([n,l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.04em', color: 'var(--text)' }}>{n}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'var(--dim)', marginTop: 4 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '2rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: 'fadeIn 1s 1s both' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--dim)' }}>SCROLL</div>
            <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--dim), transparent)', animation: 'fadeIn 1s 1.5s both' }} />
          </div>
        </div>
      </section>

      {/* TICKER */}
      <Ticker />

      {/* ── FEATURES ── */}
      <section style={{ padding: '100px 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--red)', marginBottom: '1rem' }}>// WHAT MAKES US DIFFERENT</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.04em', lineHeight: 0.92 }}>BUILT FOR<br />CREATORS</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {features.map((f, i) => (
            <div key={i} className="anim-fadeUp" style={{ background: 'var(--surface)', padding: '2.5rem', position: 'relative', transition: 'background 0.2s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: i % 3 === 0 ? 'var(--red)' : i % 3 === 1 ? 'var(--amber)' : 'var(--cyan)', opacity: 0, transition: 'opacity 0.2s' }} className="feature-top-line" />
              <div style={{ fontSize: '2rem', marginBottom: '1.25rem' }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{f.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'var(--red)', marginBottom: '0.75rem' }}>{f.sub.toUpperCase()}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 2rem', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--amber)', marginBottom: '1rem' }}>// WORKFLOW</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.04em', lineHeight: 0.92 }}>HOW IT<br />WORKS</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {steps.map((step, i) => (
              <div key={i} className="anim-fadeUp" style={{ position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: '1.5rem', right: '-1rem', width: '2rem', height: 1, background: 'var(--border)', display: 'none' }} />
                )}
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', letterSpacing: '0.04em', color: 'rgba(255,45,59,0.15)', lineHeight: 1, marginBottom: '1rem' }}>{step.num}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.1em', marginBottom: '0.75rem', color: 'var(--text)' }}>{step.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6, fontWeight: 300 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section style={{ padding: '100px 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--cyan)', marginBottom: '1rem' }}>// UNDER THE HOOD</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.04em', lineHeight: 0.92 }}>TECH<br />STACK</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {[
            { name: 'WebRTC', role: 'P2P Streaming', color: 'var(--red)' },
            { name: 'React', role: 'Frontend UI', color: 'var(--cyan)' },
            { name: 'Node.js', role: 'Backend API', color: 'var(--green)' },
            { name: 'WebSocket', role: 'Signaling Server', color: 'var(--amber)' },
            { name: 'PostgreSQL', role: 'Database', color: 'var(--red)' },
            { name: 'Supabase', role: 'Cloud Storage', color: 'var(--cyan)' },
            { name: 'BullMQ', role: 'Job Queue', color: 'var(--amber)' },
            { name: 'Prisma', role: 'ORM', color: 'var(--green)' },
          ].map((tech, i) => (
            <div key={i} style={{ background: 'var(--surface)', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: 6, transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: tech.color, marginBottom: 4 }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.06em' }}>{tech.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'var(--dim)' }}>{tech.role.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '80px 2rem', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--red)', marginBottom: '1rem' }}>// COMMON QUESTIONS</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.04em', lineHeight: 0.92 }}>FAQ</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: activeFaq === i ? 'var(--surface2)' : 'var(--surface3)', cursor: 'pointer', transition: 'background 0.2s' }}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: '0.04em', color: activeFaq === i ? 'var(--red)' : 'var(--text)' }}>{faq.q}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: activeFaq === i ? 'var(--red)' : 'var(--dim)', flexShrink: 0, transition: 'transform 0.2s', transform: activeFaq === i ? 'rotate(45deg)' : 'none' }}>+</div>
                </div>
                {activeFaq === i && (
                  <div style={{ padding: '0 1.5rem 1.25rem', fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300 }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,45,59,0.08), transparent)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--red)', marginBottom: '1.5rem' }}>// READY TO RECORD?</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '0.04em', lineHeight: 0.88, marginBottom: '2rem' }}>
            START YOUR<br />
            <span style={{ color: 'var(--red)', textShadow: '0 0 60px rgba(255,45,59,0.4)' }}>BROADCAST</span>
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', marginBottom: '3rem', fontWeight: 300 }}>
            Free to start. No credit card required. Studio-quality audio and video from day one.
          </p>
          <Link to="/signup" style={{ padding: '16px 48px', background: 'var(--red)', color: 'white', borderRadius: 8, textDecoration: 'none', fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.12em', boxShadow: '0 0 60px rgba(255,45,59,0.4)', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'white', animation: 'blink 1s ease-in-out infinite' }} />
            CREATE FREE ACCOUNT
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.06em' }}>PODCASTLY</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--dim)', letterSpacing: '0.08em' }}>
          BUILT WITH WEBRTC · REACT · NODE.JS
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--dim)', letterSpacing: '0.06em' }}>
          © 2025 PODCASTLY
        </div>
      </footer>

      <style>{`
        @keyframes orbFloat {
          from { transform: translate(-50%, -50%) scale(1); }
          to { transform: translate(-50%, -50%) scale(1.15); }
        }
      `}</style>
    </div>
  );
}
