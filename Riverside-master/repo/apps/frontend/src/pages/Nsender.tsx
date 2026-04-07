import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllVideosApi, sendChunksToBackend, sendFinalCallToEndOfRecordingApi } from "../api/api";

function Waveform({ active, bars = 14 }: { active: boolean; bars?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 24 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 2, borderRadius: 1, background: active ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
          animation: active ? `wave ${0.4 + (i % 5) * 0.15}s ease-in-out infinite alternate` : 'none',
          height: active ? undefined : 4, animationDelay: `${i * 0.05}s`,
        }} />
      ))}
    </div>
  );
}

export default function NSender() {
  const [socket, setSocket] = useState<WebSocket>();
  const [, setRoomId] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>("");
  const [loaderStopRecording, setLoaderStopRecording] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [copiedCode, setCopiedCode] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [allVideoUrls, setAllVideoUrls] = useState([]);
  const [isMerged, setIsMerged] = useState(false);
  const [disableCallButton, setDisableCallButton] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [showPanel, setShowPanel] = useState<'session' | 'status' | 'recordings'>('session');

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const roomName = location?.state?.sessionCode;
  const sessionId = location?.state?.sessionid;

  useEffect(() => {
    if (!roomName || !sessionId) { navigate('/dashboard'); return; }
    setRoomId(roomName);
    const ws = new WebSocket('wss://podcastly-ws.onrender.com');
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "sender", roomId: roomName }));
      setSocket(ws); setIsConnected(true); setConnectionStatus("Connected");
    };
    ws.onclose = () => { setIsConnected(false); setConnectionStatus("Disconnected"); };
    ws.onerror = () => { setIsConnected(false); setConnectionStatus("Error"); };
    return () => ws.close();
  }, [roomName, sessionId, navigate]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) interval = setInterval(() => setRecordingDuration(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isMerged) getAllVideos();
  }, [isMerged]);

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = micMuted; });
      setMicMuted(p => !p);
    }
  };

  const toggleCam = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => { t.enabled = camOff; });
      setCamOff(p => !p);
    }
  };

  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const copySessionCode = async () => {
    try { await navigator.clipboard.writeText(roomName); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); }
    catch (e) { console.error(e); }
  };

  const getAllVideos = async () => {
    try {
      const r: any = await getAllVideosApi(sessionId);
      setAllVideoUrls(r.data.recordings || []);
    } catch (e) { console.error(e); }
  };

  async function handleRtc() {
    if (!socket) return;
    setDisableCallButton(true);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    pcRef.current = pc;

    // GET LOCAL STREAM
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;

    // Show local camera in PiP
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play().catch(() => {});
    }

    // Add local tracks to peer connection
    stream.getTracks().forEach(t => pc.addTrack(t, stream));

    // RECEIVE GUEST'S VIDEO — this was missing before!
    pc.ontrack = (e) => {
      if (e.streams && e.streams[0] && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
        remoteVideoRef.current.play().catch(() => {});
        setHasRemoteStream(true);
      }
    };

    // Handle signaling
    socket.onmessage = async (event: any) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "receiver-remote-description") {
        await pc.setRemoteDescription(msg.sdp);
      } else if (msg.type === "receiver-iceCandidate") {
        await pc.addIceCandidate(msg.candidate);
      }
    };

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.send(JSON.stringify({ type: "create-offer", sdp: offer }));
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.send(JSON.stringify({ type: "sender-iceCandidate", candidate: e.candidate }));
    };

    // Setup recorder
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    setRecorder(mediaRecorder);
    let chunkIndex = 0;
    mediaRecorder.ondataavailable = async (e: any) => {
      if (e.data.size > 0) {
        const formData = new FormData();
        formData.append('chunk', e.data);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('sessionName', roomName);
        formData.append('sessionCode', sessionId);
        formData.append('userType', 'sender');
        await sendChunksToBackend(formData);
        chunkIndex++;
      }
    };
    mediaRecorder.onstop = () => sendFinalCall();

    async function sendFinalCall() {
      try {
        const r = await sendFinalCallToEndOfRecordingApi(roomName, 'sender', sessionId);
        setVideoUrl(r.data.url || null);
        setLoaderStopRecording(false);
        setIsRecording(false);
        setIsMerged(true);
      } catch (e) {
        setLoaderStopRecording(false);
        setIsRecording(false);
        // Poll for recordings as fallback
        setTimeout(() => getAllVideos(), 3000);
      }
    }
  }

  const startRecording = () => {
    if (recorder) {
      socket?.send(JSON.stringify({ type: 'record-video', roomId: roomName }));
      recorder.start(3000);
      setIsRecording(true);
      setRecordingDuration(0);
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      socket?.send(JSON.stringify({ type: "stop-recording", roomId: roomName }));
      setLoaderStopRecording(true);
      setIsRecording(false);
    }
  };

  const downloadVideo = (url?: string) => {
    const dl = url || videoUrl;
    if (dl) {
      const a = document.createElement('a');
      a.href = dl; a.download = `recording-${roomName}-${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
  };

  return (
    <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font)', overflow: 'hidden' }}>

      {/* TOP BAR */}
      <div style={{
        height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.25rem', flexShrink: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 500, fontFamily: 'var(--font)',
          }}>← Dashboard</button>
          <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Podcastly</span>
          </div>
          {roomName && (
            <>
              <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--tertiary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{roomName.slice(0, 18)}</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'var(--accent-soft)', border: '1px solid rgba(255,55,95,0.3)' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{formatDuration(recordingDuration)}</span>
            </div>
          )}
          {loaderStopRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.2)' }}>
              <div style={{ width: 10, height: 10, border: '2px solid var(--amber)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--amber)' }}>Processing</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: isConnected ? 'rgba(48,209,88,0.08)' : 'rgba(255,55,95,0.08)', border: `1px solid ${isConnected ? 'rgba(48,209,88,0.2)' : 'rgba(255,55,95,0.2)'}` }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: isConnected ? 'var(--green)' : 'var(--accent)' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: isConnected ? 'var(--green)' : 'var(--accent)' }}>{connectionStatus}</span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 280px', overflow: 'hidden', minHeight: 0 }}>

        {/* VIDEO AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden', minHeight: 0 }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
            {/* Remote video (guest) — main view */}
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#000' }} />

            {/* Placeholder when no call or no guest */}
            {!disableCallButton && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, background: '#000' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--tertiary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Host View</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--tertiary)' }}>Click "Start Call" to initialize your camera</div>
              </div>
            )}

            {disableCallButton && !hasRemoteStream && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, background: '#000' }}>
                <div style={{ width: 32, height: 32, border: '3px solid var(--tertiary)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--tertiary)' }}>Waiting for guest to join...</div>
              </div>
            )}

            {/* Camera off overlay */}
            {camOff && disableCallButton && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, background: '#000' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--tertiary)' }}>Camera off</span>
              </div>
            )}

            {/* Recording border */}
            {isRecording && <div style={{ position: 'absolute', inset: 0, border: '2px solid var(--accent)', pointerEvents: 'none', zIndex: 3, borderRadius: 0, animation: 'recordPulse 2s ease-in-out infinite' }} />}

            {/* Recording indicator */}
            {isRecording && (
              <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 4, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'var(--accent)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', animation: 'blink 1s ease-in-out infinite' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>REC</span>
              </div>
            )}

            {/* Local camera PiP */}
            <video ref={localVideoRef} muted autoPlay playsInline style={{
              position: 'absolute', bottom: 12, right: 12, width: 140, height: 90,
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
              objectFit: 'cover', zIndex: 4, background: '#111',
            }} />
          </div>

          {/* CONTROL BAR */}
          <div style={{
            background: 'var(--surface)', borderTop: '1px solid var(--border)',
            padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: '1rem', flexShrink: 0,
          }}>
            <Waveform active={isRecording} bars={16} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={toggleMic} title={micMuted ? 'Unmute' : 'Mute'} style={{
                width: 36, height: 36, borderRadius: '50%',
                border: `1px solid ${micMuted ? 'rgba(255,55,95,0.4)' : 'var(--border)'}`,
                background: micMuted ? 'var(--accent-soft)' : 'var(--surface2)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', transition: 'all 0.2s', position: 'relative',
              }}>
                {micMuted ? '🔇' : '🎙'}
              </button>

              <button onClick={toggleCam} title={camOff ? 'Camera on' : 'Camera off'} style={{
                width: 36, height: 36, borderRadius: '50%',
                border: `1px solid ${camOff ? 'rgba(255,55,95,0.4)' : 'var(--border)'}`,
                background: camOff ? 'var(--accent-soft)' : 'var(--surface2)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', transition: 'all 0.2s',
              }}>
                {camOff ? '📷' : '📹'}
              </button>

              {!disableCallButton && (
                <button onClick={handleRtc} style={{
                  padding: '8px 18px', background: 'var(--surface2)', color: 'var(--text)',
                  border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font)', transition: 'all 0.2s',
                }}>▶ Start Call</button>
              )}

              {socket && !isRecording && !loaderStopRecording && (
                <button onClick={startRecording} disabled={!recorder} style={{
                  padding: '8px 18px',
                  background: recorder ? 'var(--accent)' : 'var(--surface2)',
                  color: recorder ? 'white' : 'var(--tertiary)',
                  border: 'none', borderRadius: 8,
                  cursor: recorder ? 'pointer' : 'not-allowed',
                  fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: recorder ? 'white' : 'var(--tertiary)' }} />
                  Record
                </button>
              )}

              {isRecording && (
                <button onClick={stopRecording} style={{
                  padding: '8px 18px', background: 'var(--surface2)', color: 'var(--accent)',
                  border: '1px solid rgba(255,55,95,0.3)', borderRadius: 8, cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: 'var(--accent)' }} />
                  Stop
                </button>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '1.1rem', fontWeight: 600, color: isRecording ? 'var(--accent)' : 'var(--tertiary)', lineHeight: 1 }}>{formatDuration(recordingDuration)}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--tertiary)', marginTop: 2, fontWeight: 500 }}>{isRecording ? 'Recording' : 'Standby'}</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {(['session', 'status', 'recordings'] as const).map(tab => (
              <button key={tab} onClick={() => setShowPanel(tab)} style={{
                flex: 1, padding: '10px 4px', background: 'none', border: 'none',
                borderBottom: `2px solid ${showPanel === tab ? 'var(--accent)' : 'transparent'}`,
                fontSize: '0.7rem', fontWeight: 600,
                color: showPanel === tab ? 'var(--accent)' : 'var(--tertiary)',
                cursor: 'pointer', transition: 'all 0.2s', marginBottom: -1,
                fontFamily: 'var(--font)', textTransform: 'capitalize',
              }}>{tab}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', minHeight: 0 }}>
            {showPanel === 'session' && (
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--tertiary)', marginBottom: '1rem' }}>Session Details</div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--tertiary)', marginBottom: 6 }}>Session Code</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1, padding: '8px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text)', wordBreak: 'break-all' }}>{roomName || '—'}</div>
                    <button onClick={copySessionCode} style={{
                      padding: '8px 12px', background: copiedCode ? 'rgba(48,209,88,0.1)' : 'var(--surface2)',
                      border: `1px solid ${copiedCode ? 'rgba(48,209,88,0.2)' : 'var(--border)'}`,
                      borderRadius: 8, cursor: 'pointer', color: copiedCode ? 'var(--green)' : 'var(--secondary)',
                      fontFamily: 'var(--mono)', fontSize: '0.75rem', transition: 'all 0.2s', flexShrink: 0,
                    }}>{copiedCode ? '✓' : '⧉'}</button>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--tertiary)', marginTop: 4 }}>Share this code with your guest</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px', background: 'var(--accent-soft)', border: '1px solid rgba(255,55,95,0.15)', borderRadius: 10, marginBottom: '1rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,55,95,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)' }}>H</div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Host</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--tertiary)' }}>You control this session</div>
                  </div>
                </div>
                <div style={{ padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  {[['Protocol', 'WebRTC P2P'], ['Signaling', 'WebSocket'], ['Recording', 'MediaRecorder'], ['Storage', 'Supabase']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--tertiary)' }}>{k}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showPanel === 'status' && (
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--tertiary)', marginBottom: '1rem' }}>Recording Status</div>
                <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: 'var(--surface2)', border: `1px solid ${isRecording ? 'rgba(255,55,95,0.2)' : 'var(--border)'}`, borderRadius: 12, marginBottom: '1rem' }}>
                  {!disableCallButton && <><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--tertiary)', marginBottom: '0.25rem' }}>Idle</div><div style={{ fontSize: '0.75rem', color: 'var(--tertiary)' }}>Start call to begin</div></>}
                  {disableCallButton && !isRecording && !loaderStopRecording && <><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '0.25rem' }}>Ready</div><div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Hit record</div></>}
                  {isRecording && <><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)', animation: 'pulse 2s ease-in-out infinite', marginBottom: '0.25rem' }}>● REC</div><div style={{ fontFamily: 'var(--mono)', fontSize: '1.2rem', fontWeight: 600 }}>{formatDuration(recordingDuration)}</div></>}
                  {loaderStopRecording && <><div style={{ width: 28, height: 28, border: '3px solid var(--amber)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 0.75rem' }} /><div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--amber)' }}>Processing</div></>}
                </div>
                {[{ label: 'WebSocket', ok: isConnected }, { label: 'WebRTC', ok: !!disableCallButton }, { label: 'Recorder', ok: !!recorder }, { label: 'Recording', ok: isRecording }, { label: 'Merged', ok: isMerged }].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{s.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.ok ? 'var(--green)' : 'var(--tertiary)' }} />
                      <span style={{ fontSize: '0.7rem', color: s.ok ? 'var(--green)' : 'var(--tertiary)', fontWeight: 500 }}>{s.ok ? 'Active' : 'Waiting'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showPanel === 'recordings' && (
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--tertiary)', marginBottom: '1rem' }}>Recorded Tracks</div>
                <button onClick={getAllVideos} style={{
                  width: '100%', padding: '9px', background: 'var(--accent-soft)',
                  border: '1px solid rgba(255,55,95,0.2)', borderRadius: 8, cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font)',
                  marginBottom: '1rem',
                }}>↓ Fetch Recordings</button>
                {allVideoUrls.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--tertiary)' }}>No tracks yet</div>
                )}
                {allVideoUrls.map((vid: any, i: number) => (
                  <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: '0.75rem' }}>
                    <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Track {String(i + 1).padStart(2, '0')}</span>
                      <button onClick={() => downloadVideo(vid.s3Url || vid.publicUrl)} style={{
                        padding: '3px 8px', background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)',
                        borderRadius: 6, cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, color: 'var(--green)', fontFamily: 'var(--font)',
                      }}>↓ Save</button>
                    </div>
                    <video src={vid.s3Url || vid.publicUrl} controls style={{ width: '100%', maxHeight: 140, background: '#000', display: 'block' }} />
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
