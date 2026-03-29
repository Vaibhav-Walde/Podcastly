import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendChunksToBackend, sendFinalCallToEndOfRecordingApi } from "../api/api";

function Waveform({ active, color = 'var(--amber)', bars = 14 }: { active: boolean; color?: string; bars?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 28 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2, background: active ? color : 'rgba(255,255,255,0.08)',
          animation: active ? `wave ${0.4 + (i % 5) * 0.15}s ease-in-out infinite alternate` : 'none',
          height: active ? undefined : 4,
          animationDelay: `${i * 0.05}s`,
        }} />
      ))}
    </div>
  );
}

export default function NReceiver() {
  // ── All original state ──
  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [, setSocket] = useState<WebSocket>();
  const [, setRoomId] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [startRecordings, setStartRecordings] = useState<Boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loaderStopRecording, setLoaderStopRecording] = useState<Boolean>(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [readyForRecording, setReadyForRecording] = useState(false);
  const [stopRecording, setStopRecording] = useState(false);

  // ── UI-only state ──
  const [showPanel, setShowPanel] = useState<'session' | 'status'>('session');

  const location = useLocation();
  const navigate = useNavigate();
  const roomName = location?.state?.sessionCode;
  const sessionId = location?.state?.sessionId;

  // ── All original useEffects ──
  useEffect(() => {
    if (!roomName || !sessionId) { navigate('/'); return; }
    setRoomId(roomName);
    const ws = new WebSocket('wss://podcastly-ws.onrender.com');
    ws.onopen = () => {
      if (roomName) { ws.send(JSON.stringify({ type: "receiver", roomId: roomName })); setSocket(ws); setIsConnected(true); setConnectionStatus("Connected"); }
    };
    ws.onclose = () => { setIsConnected(false); setConnectionStatus("Disconnected"); };
    ws.onerror = () => { setIsConnected(false); setConnectionStatus("Connection Error"); };

    const pc = new RTCPeerConnection();
    ws.onmessage = async (event: any) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "sender-remote-description") {
        await pc.setRemoteDescription(msg.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: 'create-answer', sdp: answer }));
      } else if (msg.type === "sender-iceCandidate") {
        pc.addIceCandidate(msg.candidate);
      } else if (msg.type === "start-record") {
        if (msg.roomId === roomName) setReadyForRecording(true);
      } else if (msg.type === "stop-recording") {
        if (msg.roomId === roomName) setStopRecording(true);
      }
    };
    pc.ontrack = (e) => { setStream(e.streams[0]); };
    pc.onicecandidate = (e) => { ws.send(JSON.stringify({ type: 'receiver-iceCandidate', candidate: e.candidate })); };
    return () => ws.close();
  }, [roomName, sessionId, navigate]);

  useEffect(() => {
    if (videoRef.current && stream) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    if (localVideoRef.current && stream) { localVideoRef.current.srcObject = stream; localVideoRef.current.play(); }
    if (stream && readyForRecording) startRecording();
  }, [stream, readyForRecording]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) interval = setInterval(() => setRecordingDuration(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (recorder && stopRecording) { recorder.stop(); setLoaderStopRecording(true); setIsRecording(false); }
  }, [recorder, stopRecording]);

  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl; a.download = `recording-${roomName}-guest-${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
  };

  async function startRecording() {
    setStartRecordings(true);
    if (!stream) return;
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    setRecorder(mediaRecorder);
    mediaRecorder.start(3000);
    setIsRecording(true);
    setRecordingDuration(0);
    let chunkIndex = 0;
    mediaRecorder.ondataavailable = async (e: any) => {
      if (e.data.size > 0) {
        const formData = new FormData();
        formData.append('chunk', e.data); formData.append('chunkIndex', chunkIndex.toString());
        formData.append('sessionName', roomName); formData.append('sessionCode', sessionId);
        formData.append('userType', 'receiver');
        await sendChunksToBackend(formData); chunkIndex++;
      }
    };
    mediaRecorder.onstop = () => sendFinalCallToEndOfRecording();
    async function sendFinalCallToEndOfRecording() {
      const r = await sendFinalCallToEndOfRecordingApi(roomName, 'receiver', sessionId);
      setVideoUrl(r.data.url); setLoaderStopRecording(false); setIsRecording(false);
    }
  }

  // ── RENDER ──
  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)' }}>

      {/* TOP BAR */}
      <div style={{ height: 56, background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
            ← HOME
          </button>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.06em' }}>PODCASTLY</span>
          </div>
          {/* GUEST badge */}
          <div style={{ padding: '3px 10px', borderRadius: 4, background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--amber)' }}>
            GUEST
          </div>
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 100, background: 'rgba(255,45,59,0.12)', border: '1px solid rgba(255,45,59,0.4)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', animation: 'blink 1s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.08em', color: 'var(--red)' }}>{formatDuration(recordingDuration)}</span>
            </div>
          )}
          {loaderStopRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 100, background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.3)' }}>
              <div style={{ width: 14, height: 14, border: '2px solid var(--amber)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--amber)' }}>PROCESSING...</span>
            </div>
          )}
        </div>

        {/* Connection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 100, background: isConnected ? 'rgba(0,230,118,0.08)' : 'rgba(255,45,59,0.08)', border: `1px solid ${isConnected ? 'rgba(0,230,118,0.25)' : 'rgba(255,45,59,0.25)'}` }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: isConnected ? 'var(--green)' : 'var(--red)', animation: isConnected ? 'pulse 2s ease-in-out infinite' : 'none' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', color: isConnected ? 'var(--green)' : 'var(--red)' }}>{connectionStatus.toUpperCase()}</span>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', overflow: 'hidden' }}>

        {/* Video */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#000', position: 'relative' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)', zIndex: 1 }} />

            {/* Waiting for host */}
            {!stream && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, background: 'var(--black)' }}>
                <div style={{ width: 60, height: 60, border: '3px solid var(--border2)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '0.08em', color: 'var(--dim)', marginBottom: '0.5rem' }}>WAITING FOR HOST</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--dim)' }}>HOST MUST INITIATE THE CALL</div>
              </div>
            )}

            {/* Recording border */}
            {isRecording && <div style={{ position: 'absolute', inset: 0, border: '3px solid var(--red)', pointerEvents: 'none', zIndex: 3, animation: 'recordPulse 2s ease-in-out infinite' }} />}

            {/* ON AIR badge */}
            {isRecording && (
              <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 4, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'var(--red)', boxShadow: '0 0 20px rgba(255,45,59,0.6)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white', animation: 'blink 1s ease-in-out infinite' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.12em', color: 'white' }}>RECORDING</span>
              </div>
            )}

            {/* Ready badge */}
            {startRecordings && !isRecording && (
              <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 4, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(255,170,0,0.2)', border: '1px solid rgba(255,170,0,0.4)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.12em', color: 'var(--amber)' }}>STANDBY</span>
              </div>
            )}

            {/* Local PiP */}
            <video ref={localVideoRef} muted autoPlay playsInline style={{ position: 'absolute', bottom: 16, right: 16, width: 140, height: 90, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', objectFit: 'cover', zIndex: 4, background: '#111' }} />
          </div>

          {/* Control bar */}
          <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <Waveform active={isRecording} color="var(--amber)" bars={18} />

            <div style={{ textAlign: 'center' }}>
              {!stream && <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.1em', color: 'var(--dim)' }}>AWAITING HOST STREAM</div>}
              {stream && !startRecordings && <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.1em', color: 'var(--amber)' }}>STREAM ACTIVE — WAITING FOR REC SIGNAL</div>}
              {isRecording && <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.1em', color: 'var(--red)', animation: 'pulse 2s ease-in-out infinite' }}>⏺ RECORDING IN PROGRESS</div>}
              {loaderStopRecording && <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.1em', color: 'var(--amber)' }}>UPLOADING TO S3...</div>}
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', letterSpacing: '0.06em', color: isRecording ? 'var(--red)' : 'var(--dim)', lineHeight: 1, textAlign: 'right' }}>
              {formatDuration(recordingDuration)}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.1em', color: 'var(--dim)', marginTop: 3 }}>
                {isRecording ? 'REC' : 'STANDBY'}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {(['session', 'status'] as const).map(tab => (
              <button key={tab} onClick={() => setShowPanel(tab)} style={{ flex: 1, padding: '12px 4px', background: 'none', border: 'none', borderBottom: `2px solid ${showPanel === tab ? 'var(--amber)' : 'transparent'}`, fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.1em', color: showPanel === tab ? 'var(--amber)' : 'var(--dim)', cursor: 'pointer', marginBottom: -1 }}>
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
            {showPanel === 'session' && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--dim)', marginBottom: '1.5rem' }}>// GUEST SESSION</div>
                <div style={{ padding: '12px', background: 'rgba(255,170,0,0.06)', border: '1px solid rgba(255,170,0,0.15)', borderRadius: 8, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,170,0,0.15)', border: '1px solid rgba(255,170,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--amber)', flexShrink: 0 }}>G</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.08em' }}>GUEST SEAT</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--dim)', letterSpacing: '0.06em' }}>HOST CONTROLS RECORDING</div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--dim)', marginBottom: 8 }}>SESSION</div>
                  <div style={{ padding: '10px 12px', background: 'var(--surface3)', border: '1px solid var(--border2)', borderRadius: 6, fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.12em', color: 'var(--text)' }}>
                    {roomName || '—'}
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  {[['ROLE', 'GUEST / RECEIVER'], ['PROTOCOL', 'WebRTC P2P'], ['STREAM', stream ? '● ACTIVE' : '○ WAITING'], ['RECORDING', 'AUTO — HOST TRIGGERED']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'var(--dim)' }}>{k}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: v.startsWith('●') ? 'var(--green)' : 'var(--text)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showPanel === 'status' && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--dim)', marginBottom: '1.5rem' }}>// STATUS</div>
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'var(--surface2)', border: `1px solid ${isRecording ? 'rgba(255,45,59,0.3)' : 'var(--border)'}`, borderRadius: 10, marginBottom: '1.5rem' }}>
                  {!stream && (
                    <>
                      <div style={{ width: 36, height: 36, border: '3px solid var(--border2)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.08em', color: 'var(--dim)' }}>WAITING</div>
                    </>
                  )}
                  {stream && !isRecording && !loaderStopRecording && (
                    <>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.06em', color: 'var(--amber)', marginBottom: '0.5rem' }}>LIVE</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>STREAM CONNECTED</div>
                    </>
                  )}
                  {isRecording && (
                    <>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.06em', color: 'var(--red)', animation: 'pulse 2s ease-in-out infinite', marginBottom: '0.5rem' }}>⏺ REC</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.08em' }}>{formatDuration(recordingDuration)}</div>
                    </>
                  )}
                  {loaderStopRecording && (
                    <>
                      <div style={{ width: 40, height: 40, border: '3px solid var(--amber)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.1em', color: 'var(--amber)' }}>UPLOADING</div>
                    </>
                  )}
                </div>

                {[
                  { label: 'WEBSOCKET', ok: isConnected },
                  { label: 'HOST STREAM', ok: !!stream },
                  { label: 'RECORDING SETUP', ok: !!startRecordings },
                  { label: 'RECORDING ACTIVE', ok: isRecording },
                  { label: 'S3 COMPLETE', ok: !!videoUrl },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.08em', color: 'var(--muted)' }}>{s.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.ok ? 'var(--green)' : 'var(--surface4)', border: s.ok ? 'none' : '1px solid var(--border2)', transition: 'all 0.3s' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: s.ok ? 'var(--green)' : 'var(--dim)', letterSpacing: '0.06em' }}>{s.ok ? 'OK' : '—'}</span>
                    </div>
                  </div>
                ))}

                {/* Download button when done */}
                {videoUrl && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 8 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--green)', marginBottom: '0.75rem' }}>RECORDING COMPLETE</div>
                    <video src={videoUrl} controls style={{ width: '100%', borderRadius: 6, marginBottom: '0.75rem', background: '#000' }} />
                    <button onClick={downloadVideo} style={{ width: '100%', padding: '10px', background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--green)' }}>
                      ⬇ DOWNLOAD RECORDING
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
