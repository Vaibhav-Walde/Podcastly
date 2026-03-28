import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';

// Animated waveform bars
function Waveform({ color = 'var(--red)', bars = 12, active = true }: { color?: string; bars?: number; active?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 36 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2, background: color,
          animation: active ? `wave ${0.5 + Math.random() * 0.8}s ease-in-out infinite alternate` : 'none',
          height: active ? undefined : 5,
          animationDelay: `${i * 0.06}s`,
        }} />
      ))}
    </div>
  );
}

// Ticker tape
function Ticker() {
  const items = ['STUDIO-QUALITY RECORDING', 'WEBRTC PEER-TO-PEER', 'LOCAL-FIRST CAPTURE', 'AWS S3 CLOUD BACKUP', 'BULLMQ PROCESSING', 'ZERO QUALITY LOSS', 'SEPARATE AUDIO TRACKS', 'REAL-TIME SIGNALING'];
  return (
    <div style={{ background: 'var(--red)', overflow: 'hidden', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
      <div style={{ display: 'flex', gap: 0, animation: 'ticker 28s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.12em', color: 'white', padding: '0 3rem', opacity: 0.9 }}>
            {item} <span style={{ opacity: 0.5 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Studio clock
function StudioClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>
      {pad(time.getHours())}:{pad(time.getMinutes())}:{pad(time.getSeconds())}
    </div>
  );
}

const features = [
  { icon: '🎙', title: 'LOCAL-FIRST', sub: 'Recording', desc: 'Audio & video captured directly on-device. Internet drops? Your recording stays perfect.' },
  { icon: '⚡', title: 'WEBRTC', sub: 'Peer-to-Peer', desc: 'Sub-50ms latency between host and guest. Real broadcast studio feel, anywhere on Earth.' },
  { icon: '☁', title: 'AUTO-SYNC', sub: 'AWS S3', desc: 'Chunks upload continuously during recording. BullMQ merges tracks when session ends.' },
  { icon: '🔀', title: 'MULTI-TRACK', sub: 'Isolation', desc: 'Every participant gets a separate, isolated track. Producer-grade post-production ready.' },
  { icon: '⏱', title: 'REAL-TIME', sub: 'Signaling', desc: 'WebSocket signaling server keeps every participant perfectly in sync every millisecond.' },
  { icon: '🔑', title: 'SESSION', sub: 'Codes', desc: 'Unique codes per session. Guests join instantly — no account, no downloads required.' },
];

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      <Navbar />

      {/* HERO */}
      <div ref={heroRef} style={{ minHeight: '100vh', paddingTop: 68, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Dynamic gradient follows mouse */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 60% 50% at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,45,59,0.1), transparent 60%)`,
          transition: 'background 0.3s ease',
        }} />
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.035, backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
        {/* Red corner accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 300, height: 300, background: 'radial-gradient(circle at 0% 0%, rgba(255,45,59,0.15), transparent 60%)', pointerEvents: 'none' }} />

        {/* Top info bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <StudioClock />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--dim)', letterSpacing: '0.1em' }}>BROADCAST STUDIO v2.0</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--green)', letterSpacing: '0.1em' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s ease-in-out infinite' }} />
            ALL SYSTEMS OPERATIONAL
          </div>
        </div>

        {/* Main hero content */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '4rem 2rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%', gap: '4rem', position: 'relative', zIndex: 1 }}>
          {/* Left */}
          <div style={{ flex: 1 }}>
            <div className="anim-fadeUp" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 4, background: 'var(--red-dim)', border: '1px solid rgba(255,45,59,0.25)', marginBottom: '2rem' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', animation: 'blink 1.2s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--red)' }}>ON AIR — STUDIO RECORDING PLATFORM</span>
            </div>

            <h1 className="anim-fadeUp-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(4rem,9vw,8rem)', lineHeight: 0.9, letterSpacing: '0.04em', color: 'var(--text)', marginBottom: '2rem' }}>
              RECORD<br />
              <span style={{ color: 'var(--red)', textShadow: '0 0 40px rgba(255,45,59,0.4)' }}>STUDIO</span><br />
              QUALITY
            </h1>

            <p className="anim-fadeUp-2" style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.75, maxWidth: 480, marginBottom: '3rem', fontWeight: 300 }}>
              WebRTC peer-to-peer sessions with local-first recording. Each participant captures their own crystal-clear audio & video — uploaded to AWS S3 automatically. Zero quality loss, ever.
            </p>

            <div className="anim-fadeUp-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link to="/signup" style={{ padding: '14px 36px', background: 'var(--red)', color: 'white', borderRadius: 6, fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.1em', textDecoration: 'none', display: 'inline-block', boxShadow: '0 0 30px rgba(255,45,59,0.3)', transition: 'box-shadow 0.3s' }}>
                START RECORDING
              </Link>
              <Link to="/login" style={{ padding: '14px 36px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border2)', borderRadius: 6, fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.1em', textDecoration: 'none', display: 'inline-block' }}>
                SIGN IN
              </Link>
            </div>

            {/* Stats */}
            <div className="anim-fadeUp-4" style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              {[['48K+','Creators'],['2.1M','Episodes'],['<50ms','Latency'],['99.9%','Uptime']].map(([n,l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', letterSpacing: '0.04em', color: 'var(--text)', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--dim)', marginTop: 4 }}>{l.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Studio mockup */}
          <div className="anim-fadeUp-2" style={{ flex: 1, maxWidth: 520 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 0 60px rgba(255,45,59,0.1), 0 40px 80px rgba(0,0,0,0.5)' }}>
              {/* Studio header */}
              <div style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {['#ff2d3b','#ffaa00','#00e676'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em', color: 'var(--dim)' }}>TECH TRENDS EP.14 — LIVE SESSION</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 4, background: 'var(--red-dim)', border: '1px solid rgba(255,45,59,0.3)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'blink 1.2s ease-in-out infinite' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'var(--red)' }}>REC</span>
                </div>
              </div>

              {/* Participants */}
              <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { initials: 'VK', name: 'Vaibhav Kumar', role: 'HOST', color: 'var(--red)', active: true },
                  { initials: 'SJ', name: 'Sarah Johnson', role: 'GUEST', color: 'var(--amber)', active: false },
                ].map((p) => (
                  <div key={p.name} style={{ background: 'var(--surface3)', border: `1px solid ${p.active ? 'rgba(255,45,59,0.4)' : 'var(--border)'}`, borderRadius: 10, padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative', overflow: 'hidden', animation: p.active ? 'borderGlow 2.5s ease-in-out infinite' : 'none' }}>
                    {p.active && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,45,59,0.08), transparent)', pointerEvents: 'none' }} />}
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: `rgba(${p.color === 'var(--red)' ? '255,45,59' : '255,170,0'},0.12)`, border: `1.5px solid ${p.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: p.color }}>
                      {p.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 500, textAlign: 'center' }}>{p.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em', color: 'var(--dim)', textAlign: 'center', marginTop: 2 }}>{p.role}</div>
                    </div>
                    <Waveform color={p.color} bars={9} active={p.active} />
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface2)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--dim)', letterSpacing: '0.08em' }}>DURATION</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.06em', color: 'var(--red)' }}>14:27</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['🎙', '📷', '⏹'].map((icon, i) => (
                    <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: i === 2 ? 'rgba(255,45,59,0.15)' : 'var(--surface4)', border: `1px solid ${i === 2 ? 'rgba(255,45,59,0.4)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                      {icon}
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--dim)', textAlign: 'right', lineHeight: 1.6 }}>
                  LOCAL BACKUP<br />
                  <span style={{ color: 'var(--green)' }}>● S3 SYNC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TICKER */}
      <Ticker />

      {/* FEATURES */}
      <section style={{ padding: '120px 2rem', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '5rem', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--red)', marginBottom: '1rem' }}>// TECHNICAL CAPABILITIES</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem,6vw,5rem)', letterSpacing: '0.04em', lineHeight: 0.95 }}>
                BUILT FOR<br /><span style={{ color: 'var(--red)' }}>QUALITY</span>
              </h2>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--muted)', maxWidth: 380, lineHeight: 1.75, fontWeight: 300 }}>
              Every architectural decision optimized for one thing: the highest quality recording humanly possible over the internet.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 1, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {features.map((f, i) => (
              <div key={f.title} style={{ background: 'var(--black)', padding: '2.5rem', borderBottom: '1px solid var(--border)', transition: 'background 0.3s', cursor: 'default', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--surface2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--black)'; }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: i % 2 === 0 ? 'var(--red)' : 'transparent', opacity: 0.5 }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.14em', color: 'var(--dim)', marginBottom: '1.5rem' }}>0{i + 1}</div>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{f.icon}</div>
                <div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', letterSpacing: '0.08em', color: 'var(--red)' }}>{f.title}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', letterSpacing: '0.08em', color: 'var(--text)', marginLeft: 8 }}>{f.sub}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.7, marginTop: '0.75rem', fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '120px 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--red)', marginBottom: '1rem' }}>// WORKFLOW</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem,6vw,5rem)', letterSpacing: '0.04em', lineHeight: 0.95, marginBottom: '5rem' }}>
            FOUR STEPS<br />TO <span style={{ color: 'var(--red)' }}>BROADCAST</span>
          </h2>
          {[
            { n: '01', t: 'CREATE SESSION', d: 'Name your episode. Get a unique session code. Your recording room is instantly live.' },
            { n: '02', t: 'INVITE GUESTS', d: 'Share the code. Guests join in any browser — no account, no download, no friction.' },
            { n: '03', t: 'RECORD LOCALLY', d: 'Every participant records their own high-quality feed directly on their device. WebRTC keeps the conversation in sync.' },
            { n: '04', t: 'AUTO-UPLOAD', d: 'S3 upload runs during the session. BullMQ merges all tracks when you stop. Dashboard shows everything ready.' },
          ].map((s, i) => (
            <div key={s.n} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '2rem', padding: '2.5rem 0', borderTop: '1px solid var(--border)', alignItems: 'start' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', letterSpacing: '0.04em', color: i === 0 ? 'var(--red)' : 'var(--dim)', lineHeight: 1 }}>{s.n}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{s.t}</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '120px 2rem', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--red)', marginBottom: '1rem' }}>// PRICING</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem,6vw,5rem)', letterSpacing: '0.04em', lineHeight: 0.95, marginBottom: '5rem' }}>
            TRANSPARENT<br /><span style={{ color: 'var(--red)' }}>PRICING</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.5rem' }}>
            {[
              { name: 'STARTER', price: '$15', period: '/month', features: ['3 hrs recording / month', '720p local video', '2 participants', 'S3 storage', 'Track management'], hot: false },
              { name: 'PRO', price: '$35', period: '/month', features: ['10 hrs recording / month', '1080p local video', '5 participants', 'Priority S3 processing', 'Separate audio tracks', 'Producer dashboard'], hot: true },
              { name: 'STUDIO', price: '$79', period: '/month', features: ['Unlimited recording', '4K local video', '8 participants', 'Custom branding', 'API access', 'Dedicated support'], hot: false },
            ].map(p => (
              <div key={p.name} style={{ background: p.hot ? 'linear-gradient(135deg,var(--surface3),rgba(255,45,59,0.04))' : 'var(--black)', border: p.hot ? '1px solid rgba(255,45,59,0.4)' : '1px solid var(--border)', borderRadius: 12, padding: '2.5rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                {p.hot && <div style={{ position: 'absolute', top: 0, right: 0, padding: '6px 14px', background: 'var(--red)', fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', borderBottomLeftRadius: 8 }}>POPULAR</div>}
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.1em', marginBottom: '1.5rem', color: p.hot ? 'var(--red)' : 'var(--text)' }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: '0.25rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', letterSpacing: '-0.02em', lineHeight: 1 }}>{p.price}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>{p.period}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0' }} />
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, marginBottom: '2rem' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', color: 'var(--muted)', fontWeight: 300 }}>
                      <span style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>→</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 6, background: p.hot ? 'var(--red)' : 'transparent', color: p.hot ? 'white' : 'var(--text)', border: p.hot ? 'none' : '1px solid var(--border2)', fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: '0.1em', textDecoration: 'none' }}>
                  GET STARTED
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,45,59,0.08), transparent)', pointerEvents: 'none' }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'var(--red)', marginBottom: '1.5rem', position: 'relative' }}>// YOUR STUDIO IS WAITING</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem,8vw,7rem)', letterSpacing: '0.04em', lineHeight: 0.9, marginBottom: '2.5rem', position: 'relative' }}>
          HIT<br /><span style={{ color: 'var(--red)', textShadow: '0 0 60px rgba(255,45,59,0.4)' }}>RECORD</span>
        </h2>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <Link to="/signup" style={{ padding: '16px 48px', background: 'var(--red)', color: 'white', borderRadius: 6, fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.1em', textDecoration: 'none', boxShadow: '0 0 40px rgba(255,45,59,0.4)' }}>
            START FREE
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '2rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 5, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.06em' }}>PODCASTLY</span>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--dim)', letterSpacing: '0.08em' }}>© 2025 PODCASTLY — WEBRTC · AWS S3 · BULLMQ · PRISMA</p>
      </footer>
    </div>
  );
}
