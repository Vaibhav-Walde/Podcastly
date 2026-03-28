import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllVideosApi, sendChunksToBackend, sendFinalCallToEndOfRecordingApi } from "../api/api";

// ── Animated waveform ──
function Waveform({ active, color = 'var(--red)', bars = 16 }: { active: boolean; color?: string; bars?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 32 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2, background: active ? color : 'rgba(255,255,255,0.1)',
          animation: active ? `wave ${0.4 + (i % 5) * 0.15}s ease-in-out infinite alternate` : 'none',
          height: active ? undefined : 4,
          animationDelay: `${i * 0.05}s`,
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}

// ── VU Meter ──
function VUMeter({ active }: { active: boolean }) {
  const levels = [90, 75, 60, 80, 55, 70, 85, 50, 65, 75];
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 40 }}>
      {levels.map((h, i) => (
        <div key={i} style={{
          width: 6, borderRadius: 2,
          background: h > 80 ? 'var(--red)' : h > 60 ? 'var(--amber)' : 'var(--green)',
          height: active ? `${h}%` : '10%',
          transition: `height ${0.1 + i * 0.03}s ease`,
          animation: active ? `wave ${0.3 + i * 0.12}s ease-in-out infinite alternate` : 'none',
          animationDelay: `${i * 0.04}s`,
        }} />
      ))}
    </div>
  );
}

export default function NSender() {
  // ── All original state ──
  const [socket, setSocket] = useState<WebSocket>();
  const [, setRoomId] = useState<string | null>(null);
  const [, setStream] = useState<MediaStream | any>();
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>("");
  const [loaderStopRecording, setLoaderStopRecording] = useState<Boolean>(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [copiedCode, setCopiedCode] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [allVideoUrls, setAllVideoUrls] = useState([]);
  const [isMerged, setIsMerged] = useState<Boolean>(false);
  const [disableCallButton, setDisableCallButton] = useState(false);

  // ── UI-only state ──
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [showPanel, setShowPanel] = useState<'session' | 'status' | 'recordings'>('session');

  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const roomName = location?.state?.sessionCode;
  const sessionId = location?.state?.sessionid;

  // ── All original useEffects ──
  useEffect(() => {
    if (!roomName || !sessionId) { navigate('/'); return; }
    setRoomId(roomName);
    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      if (roomName) {
        ws.send(JSON.stringify({ type: "sender", roomId: roomName }));
        setSocket(ws); setIsConnected(true); setConnectionStatus("Connected");
      }
    };
    ws.onclose = () => { setIsConnected(false); setConnectionStatus("Disconnected"); };
    ws.onerror = () => { setIsConnected(false); setConnectionStatus("Connection Error"); };
    return () => ws.close();
  }, [roomName, sessionId, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) interval = setInterval(() => setRecordingDuration(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isMerged === true) getAllVideos();
  }, [isMerged]);

  // ── All original functions ──
  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const copySessionCode = async () => {
    try { await navigator.clipboard.writeText(roomName); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
    catch (e) { console.error(e); }
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl; a.download = `recording-${roomName}-${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
  };

  const getAllVideos = async () => {
    try {
      const r: any = await getAllVideosApi(sessionId);
      setAllVideoUrls(r.data.recordings);
    } catch (e) { console.error(e); }
  };

  async function handleRtc() {
    if (!socket) return;
    setDisableCallButton(true);
    socket.onmessage = async (event: any) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "receiver-remote-description") { pc?.setRemoteDescription(msg.sdp); socket.send(JSON.stringify({ hi: "hh" })); }
      else if (msg.type === "receiver-iceCandidate") { pc?.addIceCandidate(msg.candidate); }
    };
    const pc = new RTCPeerConnection();
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setStream(stream);
    if (videoRef.current) { videoRef.current.srcObject = stream; stream.getTracks().forEach(t => pc.addTrack(t, stream)); videoRef.current.play(); }
    if (localVideoRef.current) { localVideoRef.current.srcObject = stream; localVideoRef.current.play(); }
    pc.onnegotiationneeded = async () => { const offer = await pc.createOffer(); await pc.setLocalDescription(offer); socket?.send(JSON.stringify({ type: "create-offer", sdp: offer })); };
    pc.onicecandidate = async (e) => { if (e.candidate) socket?.send(JSON.stringify({ type: "sender-iceCandidate", candidate: e.candidate })); };
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    setRecorder(mediaRecorder);
    let chunkIndex = 0;
    mediaRecorder.ondataavailable = async (e: any) => {
      if (e.data.size > 0) { const formData = new FormData(); formData.append('chunk', e.data); formData.append('chunkIndex', chunkIndex.toString()); formData.append('sessionName', roomName); formData.append('sessionCode', sessionId); formData.append('userType', 'sender'); await sendChunksToBackend(formData); chunkIndex++; }
    };
    mediaRecorder.onstop = () => sendFinalCallToEndOfRecording();
    async function sendFinalCallToEndOfRecording() {
      const r = await sendFinalCallToEndOfRecordingApi(roomName, 'sender', sessionId);
      setVideoUrl(r.data.url); setLoaderStopRecording(false); setIsRecording(false); setIsMerged(true);
    }
  }

  const startRecording = () => {
    if (recorder) { socket?.send(JSON.stringify({ type: 'record-video', roomId: roomName })); recorder.start(3000); setIsRecording(true); setRecordingDuration(0); }
  };

  const stopRecording = () => {
    if (recorder) { recorder.stop(); socket?.send(JSON.stringify({ type: "stop-recording", roomId: roomName })); setLoaderStopRecording(true); setIsRecording(false); }
  };

  // ── RENDER ──
  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)' }}>

      {/* ── TOP BAR ── */}
      <div style={{ height: 56, background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', flexShrink: 0, zIndex: 10 }}>
        {/* Left — Logo + session */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← DASHBOARD
          </button>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.06em' }}>PODCASTLY</span>
          </div>
          {roomName && (
            <>
              <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.06em', color: 'var(--muted)' }}>{roomName}</div>
            </>
          )}
        </div>

        {/* Center — Recording timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 100, background: 'rgba(255,45,59,0.12)', border: '1px solid rgba(255,45,59,0.4)', animation: 'pulse 2s ease-in-out infinite' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', animation: 'blink 1s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.08em', color: 'var(--red)' }}>
                {formatDuration(recordingDuration)}
              </span>
            </div>
          )}
          {loaderStopRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 100, background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)' }}>
              <div style={{ width: 14, height: 14, border: '2px solid var(--amber)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--amber)' }}>PROCESSING...</span>
            </div>
          )}
        </div>

        {/* Right — Connection status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 100, background: isConnected ? 'rgba(0,230,118,0.08)' : 'rgba(255,45,59,0.08)', border: `1px solid ${isConnected ? 'rgba(0,230,118,0.25)' : 'rgba(255,45,59,0.25)'}` }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: isConnected ? 'var(--green)' : 'var(--red)', animation: isConnected ? 'pulse 2s ease-in-out infinite' : 'none' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', color: isConnected ? 'var(--green)' : 'var(--red)' }}>{connectionStatus.toUpperCase()}</span>
        </div>
      </div>

      {/* ── MAIN STUDIO ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>

        {/* Video area */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#000', position: 'relative', overflow: 'hidden' }}>

          {/* Main video feed */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

            {/* Corner scanlines */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)', zIndex: 1 }} />

            {/* Placeholder when no stream */}
            {!disableCallButton && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, background: 'var(--black)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', letterSpacing: '0.06em', color: 'var(--dim)', lineHeight: 1, marginBottom: '1rem' }}>HOST</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.12em', color: 'var(--dim)' }}>CLICK "START CALL" TO INITIALIZE CAMERA</div>
              </div>
            )}

            {/* Recording border pulse */}
            {isRecording && (
              <div style={{ position: 'absolute', inset: 0, border: '3px solid var(--red)', pointerEvents: 'none', zIndex: 3, animation: 'recordPulse 2s ease-in-out infinite' }} />
            )}

            {/* ON AIR badge */}
            {isRecording && (
              <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 4, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'var(--red)', boxShadow: '0 0 20px rgba(255,45,59,0.6)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white', animation: 'blink 1s ease-in-out infinite' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.12em', color: 'white' }}>ON AIR</span>
              </div>
            )}

            {/* VU meter overlay */}
            {isRecording && (
              <div style={{ position: 'absolute', bottom: 80, left: 16, zIndex: 4 }}>
                <VUMeter active={isRecording} />
              </div>
            )}

            {/* Local PiP */}
            <video ref={localVideoRef} muted autoPlay playsInline style={{ position: 'absolute', bottom: 16, right: 16, width: 160, height: 100, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', objectFit: 'cover', zIndex: 4, background: '#111' }} />
          </div>

          {/* ── CONTROL BAR ── */}
          <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexShrink: 0 }}>
            {/* Waveform */}
            <Waveform active={isRecording} bars={20} />

            {/* Main controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Mic toggle */}
              <button onClick={() => setMicMuted(p => !p)} style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${micMuted ? 'rgba(255,45,59,0.4)' : 'var(--border2)'}`, background: micMuted ? 'rgba(255,45,59,0.1)' : 'var(--surface3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: micMuted ? 'var(--red)' : 'var(--muted)', transition: 'all 0.2s', position: 'relative' }}>
                🎙
                {micMuted && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--red)', animation: 'none' }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'var(--red)', transform: 'translateY(-50%) rotate(-45deg)' }} />
                </div>}
              </button>

              {/* Camera toggle */}
              <button onClick={() => setCamOff(p => !p)} style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${camOff ? 'rgba(255,45,59,0.4)' : 'var(--border2)'}`, background: camOff ? 'rgba(255,45,59,0.1)' : 'var(--surface3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: camOff ? 'var(--red)' : 'var(--muted)', transition: 'all 0.2s' }}>
                📷
              </button>

              {/* Start Call */}
              {!disableCallButton && (
                <button onClick={handleRtc} style={{ padding: '10px 24px', background: 'var(--surface3)', color: 'var(--text)', border: '1px solid var(--border2)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.08em', transition: 'all 0.2s' }}>
                  ▶ START CALL
                </button>
              )}

              {/* Record / Stop */}
              {socket && !isRecording && !loaderStopRecording && (
                <button onClick={startRecording} disabled={!recorder} style={{ padding: '10px 24px', background: recorder ? 'var(--red)' : 'var(--surface3)', color: recorder ? 'white' : 'var(--dim)', border: 'none', borderRadius: 8, cursor: recorder ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.08em', boxShadow: recorder ? '0 0 20px rgba(255,45,59,0.4)' : 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: recorder ? 'white' : 'var(--dim)' }} />
                  START REC
                </button>
              )}

              {isRecording && (
                <button onClick={stopRecording} style={{ padding: '10px 24px', background: 'var(--surface3)', color: 'var(--red)', border: '1px solid rgba(255,45,59,0.4)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--red)' }} />
                  STOP REC
                </button>
              )}
            </div>

            {/* Duration display */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.06em', color: isRecording ? 'var(--red)' : 'var(--dim)', lineHeight: 1 }}>
                {formatDuration(recordingDuration)}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.1em', color: 'var(--dim)', marginTop: 3 }}>
                {isRecording ? 'RECORDING' : 'STANDBY'}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Panel tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {(['session', 'status', 'recordings'] as const).map(tab => (
              <button key={tab} onClick={() => setShowPanel(tab)} style={{ flex: 1, padding: '12px 4px', background: 'none', border: 'none', borderBottom: `2px solid ${showPanel === tab ? 'var(--red)' : 'transparent'}`, fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.1em', color: showPanel === tab ? 'var(--red)' : 'var(--dim)', cursor: 'pointer', transition: 'all 0.2s', marginBottom: -1 }}>
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>

            {/* SESSION TAB */}
            {showPanel === 'session' && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--dim)', marginBottom: '1.5rem' }}>// SESSION DETAILS</div>

                {/* Session code */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--dim)', marginBottom: 8 }}>SESSION CODE</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, padding: '10px 12px', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 6, fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.12em', color: 'var(--text)' }}>
                      {roomName || '—'}
                    </div>
                    <button onClick={copySessionCode} style={{ padding: '10px 14px', background: copiedCode ? 'rgba(0,230,118,0.1)' : 'var(--surface3)', border: `1px solid ${copiedCode ? 'rgba(0,230,118,0.3)' : 'var(--border2)'}`, borderRadius: 6, cursor: 'pointer', color: copiedCode ? 'var(--green)' : 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', transition: 'all 0.2s' }}>
                      {copiedCode ? '✓' : '⧉'}
                    </button>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--dim)', marginTop: 6, letterSpacing: '0.06em' }}>SHARE THIS CODE WITH YOUR GUESTS</div>
                </div>

                {/* Role badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: 'rgba(255,45,59,0.06)', border: '1px solid rgba(255,45,59,0.15)', borderRadius: 8, marginBottom: '1.5rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,45,59,0.15)', border: '1px solid rgba(255,45,59,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.06em', color: 'var(--red)' }}>H</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.08em' }}>HOST SEAT</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--dim)', letterSpacing: '0.06em' }}>YOU CONTROL THIS SESSION</div>
                  </div>
                </div>

                {/* Connection info */}
                <div style={{ padding: '12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  {[
                    ['PROTOCOL', 'WebRTC P2P'],
                    ['SIGNALING', 'WebSocket :8080'],
                    ['RECORDING', 'MediaRecorder API'],
                    ['UPLOAD', 'AWS S3 Chunks'],
                    ['PROCESSING', 'BullMQ Queue'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'var(--dim)' }}>{k}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STATUS TAB */}
            {showPanel === 'status' && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--dim)', marginBottom: '1.5rem' }}>// RECORDING STATUS</div>

                {/* Big status indicator */}
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--surface2)', border: `1px solid ${isRecording ? 'rgba(255,45,59,0.3)' : 'var(--border)'}`, borderRadius: 10, marginBottom: '1.5rem' }}>
                  {!socket && !disableCallButton && (
                    <>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '0.06em', color: 'var(--dim)', marginBottom: '0.5rem' }}>IDLE</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--dim)' }}>START CALL TO BEGIN</div>
                    </>
                  )}
                  {socket && !isRecording && !loaderStopRecording && (
                    <>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '0.06em', color: 'var(--amber)', marginBottom: '0.5rem' }}>READY</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>CALL ACTIVE — HIT RECORD</div>
                    </>
                  )}
                  {isRecording && (
                    <>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', letterSpacing: '0.06em', color: 'var(--red)', animation: 'pulse 2s ease-in-out infinite', marginBottom: '0.5rem' }}>⏺ REC</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.08em', color: 'var(--text)' }}>{formatDuration(recordingDuration)}</div>
                    </>
                  )}
                  {loaderStopRecording && (
                    <>
                      <div style={{ width: 40, height: 40, border: '3px solid var(--amber)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.1em', color: 'var(--amber)' }}>PROCESSING</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--dim)', marginTop: '0.5rem', letterSpacing: '0.08em' }}>UPLOADING TO S3...</div>
                    </>
                  )}
                </div>

                {/* Status steps */}
                {[
                  { label: 'WEBSOCKET', ok: isConnected },
                  { label: 'WEBRTC CALL', ok: !!disableCallButton },
                  { label: 'MEDIA RECORDER', ok: !!recorder },
                  { label: 'RECORDING ACTIVE', ok: isRecording },
                  { label: 'S3 MERGED', ok: !!isMerged },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.08em', color: 'var(--muted)' }}>{s.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.ok ? 'var(--green)' : 'var(--surface4)', border: s.ok ? 'none' : '1px solid var(--border2)', transition: 'all 0.3s' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: s.ok ? 'var(--green)' : 'var(--dim)', letterSpacing: '0.06em' }}>{s.ok ? 'ACTIVE' : 'WAITING'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* RECORDINGS TAB */}
            {showPanel === 'recordings' && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--dim)', marginBottom: '1.5rem' }}>// RECORDED TRACKS</div>
                <button onClick={getAllVideos} style={{ width: '100%', padding: '10px', background: 'var(--red-dim)', border: '1px solid rgba(255,45,59,0.25)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--red)', marginBottom: '1.5rem' }}>
                  ⬇ FETCH ALL RECORDINGS
                </button>

                {allVideoUrls.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--dim)', letterSpacing: '0.08em' }}>NO TRACKS YET</div>
                  </div>
                )}

                {allVideoUrls.map((vid: any, i: number) => (
                  <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: '1rem' }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '0.08em' }}>TRACK {String(i + 1).padStart(2, '0')}</span>
                      <button onClick={downloadVideo} style={{ padding: '4px 10px', background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.25)', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.08em', color: 'var(--green)' }}>
                        ⬇ SAVE
                      </button>
                    </div>
                    <video src={vid.s3Url} controls style={{ width: '100%', maxHeight: 160, background: '#000', display: 'block' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
