import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendChunksToBackend, sendFinalCallToEndOfRecordingApi } from "../api/api";

function Waveform({ active, bars = 14, color = 'var(--amber)' }: { active: boolean; bars?: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 24 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 2, borderRadius: 1, background: active ? color : 'rgba(255,255,255,0.08)',
          animation: active ? `wave ${0.4 + (i % 5) * 0.15}s ease-in-out infinite alternate` : 'none',
          height: active ? undefined : 4, animationDelay: `${i * 0.05}s`,
        }} />
      ))}
    </div>
  );
}

export default function NReceiver() {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [, setSocket] = useState<WebSocket>();
  const [, setRoomId] = useState<string>("");
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [startRecordings, setStartRecordings] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loaderStopRecording, setLoaderStopRecording] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [readyForRecording, setReadyForRecording] = useState(false);
  const [stopRecordingSignal, setStopRecordingSignal] = useState(false);
  const [showPanel, setShowPanel] = useState<'session' | 'status'>('session');

  const location = useLocation();
  const navigate = useNavigate();
  const roomName = location?.state?.sessionCode;
  const sessionId = location?.state?.sessionId;

  useEffect(() => {
    if (!roomName || !sessionId) { navigate('/dashboard'); return; }
    setRoomId(roomName);

    const ws = new WebSocket('wss://podcastly-ws.onrender.com');
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    pcRef.current = pc;

    // Open guest's own camera and add tracks to peer connection
    // so the HOST can see the guest
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(localStream => {
      localStreamRef.current = localStream;
      // Show guest's own camera in PiP
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play().catch(() => {});
      }
      // Add guest's tracks to the peer connection so host receives them
      localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    }).catch(err => {
      console.error("Failed to get guest camera:", err);
    });

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "receiver", roomId: roomName }));
      setSocket(ws); setIsConnected(true); setConnectionStatus("Connected");
    };
    ws.onclose = () => { setIsConnected(false); setConnectionStatus("Disconnected"); };
    ws.onerror = () => { setIsConnected(false); setConnectionStatus("Error"); };

    ws.onmessage = async (event: any) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "sender-remote-description") {
        await pc.setRemoteDescription(msg.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: 'create-answer', sdp: answer }));
      } else if (msg.type === "sender-iceCandidate") {
        if (msg.candidate) pc.addIceCandidate(msg.candidate);
      } else if (msg.type === "start-record") {
        if (msg.roomId === roomName) setReadyForRecording(true);
      } else if (msg.type === "stop-recording") {
        if (msg.roomId === roomName) setStopRecordingSignal(true);
      } else if (msg.type === "host-left") {
        setIsConnected(false);
        setConnectionStatus("Host left");
      }
    };

    // Receive host's video stream
    pc.ontrack = (e) => {
      if (e.streams && e.streams[0]) setRemoteStream(e.streams[0]);
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) ws.send(JSON.stringify({ type: 'receiver-iceCandidate', candidate: e.candidate }));
    };

    return () => {
      ws.close();
      pc.close();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [roomName, sessionId, navigate]);

  // Attach remote stream to video element whenever it changes
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(console.error);
    }
    // Record LOCAL stream (guest's own camera), not the remote stream
    if (localStreamRef.current && readyForRecording && !startRecordings) {
      startRecordingFn(localStreamRef.current);
    }
  }, [remoteStream, readyForRecording]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) interval = setInterval(() => setRecordingDuration(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (recorder && stopRecordingSignal) {
      recorder.stop();
      setLoaderStopRecording(true);
      setIsRecording(false);
    }
  }, [recorder, stopRecordingSignal]);

  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl; a.download = `recording-${roomName}-guest-${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
  };

  async function startRecordingFn(s: MediaStream) {
    setStartRecordings(true);
    const mediaRecorder = new MediaRecorder(s, { mimeType: "video/webm" });
    setRecorder(mediaRecorder);
    mediaRecorder.start(3000);
    setIsRecording(true);
    setRecordingDuration(0);
    let chunkIndex = 0;
    mediaRecorder.ondataavailable = async (e: any) => {
      if (e.data.size > 0) {
        const formData = new FormData();
        formData.append('chunk', e.data);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('sessionName', roomName);
        formData.append('sessionCode', sessionId);
        formData.append('userType', 'receiver');
        await sendChunksToBackend(formData);
        chunkIndex++;
      }
    };
    mediaRecorder.onstop = async () => {
      try {
        const r = await sendFinalCallToEndOfRecordingApi(roomName, 'receiver', sessionId);
        setVideoUrl(r.data.url || null);
        setLoaderStopRecording(false);
        setIsRecording(false);
      } catch (e) {
        setLoaderStopRecording(false);
        setIsRecording(false);
      }
    };
  }

  return (
    <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font)', overflow: 'hidden' }}>

      {/* TOP BAR */}
      <div style={{
        height: 52, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.25rem', flexShrink: 0,
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
          <div style={{ padding: '3px 10px', borderRadius: 12, background: 'rgba(255,159,10,0.1)', border: '1px solid rgba(255,159,10,0.2)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--amber)' }}>Guest</div>
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

        {/* VIDEO */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden', minHeight: 0 }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
            {/* Remote video (host's stream) — main view */}
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#000' }} />

            {!remoteStream && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, background: '#000' }}>
                <div style={{ width: 36, height: 36, border: '3px solid var(--tertiary)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--tertiary)', marginBottom: '0.25rem' }}>Waiting for host</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--tertiary)' }}>Host must start the call</div>
              </div>
            )}

            {isRecording && <div style={{ position: 'absolute', inset: 0, border: '2px solid var(--accent)', pointerEvents: 'none', zIndex: 3, animation: 'recordPulse 2s ease-in-out infinite' }} />}
            {isRecording && (
              <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 4, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'var(--accent)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', animation: 'blink 1s ease-in-out infinite' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>REC</span>
              </div>
            )}

            {/* Guest's own camera PiP */}
            <video ref={localVideoRef} muted autoPlay playsInline style={{
              position: 'absolute', bottom: 12, right: 12, width: 130, height: 82,
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
              objectFit: 'cover', zIndex: 4, background: '#111',
            }} />
          </div>

          <div style={{
            background: 'var(--surface)', borderTop: '1px solid var(--border)',
            padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexShrink: 0,
          }}>
            <Waveform active={isRecording} color="var(--amber)" bars={14} />
            <div style={{ textAlign: 'center' }}>
              {!remoteStream && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--tertiary)' }}>Awaiting host stream</span>}
              {remoteStream && !startRecordings && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--amber)' }}>Stream active</span>}
              {isRecording && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', animation: 'pulse 2s ease-in-out infinite' }}>● Recording</span>}
              {loaderStopRecording && <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--amber)' }}>Processing...</span>}
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
            {(['session', 'status'] as const).map(tab => (
              <button key={tab} onClick={() => setShowPanel(tab)} style={{
                flex: 1, padding: '10px 4px', background: 'none', border: 'none',
                borderBottom: `2px solid ${showPanel === tab ? 'var(--amber)' : 'transparent'}`,
                fontSize: '0.7rem', fontWeight: 600,
                color: showPanel === tab ? 'var(--amber)' : 'var(--tertiary)',
                cursor: 'pointer', marginBottom: -1, fontFamily: 'var(--font)', textTransform: 'capitalize',
              }}>{tab}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', minHeight: 0 }}>
            {showPanel === 'session' && (
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--tertiary)', marginBottom: '1rem' }}>Guest Session</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px', background: 'rgba(255,159,10,0.06)', border: '1px solid rgba(255,159,10,0.15)', borderRadius: 10, marginBottom: '1rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,159,10,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--amber)', flexShrink: 0 }}>G</div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Guest</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--tertiary)' }}>Host controls recording</div>
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--tertiary)', marginBottom: 6 }}>Session</div>
                  <div style={{ padding: '8px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text)', wordBreak: 'break-all' }}>{roomName || '—'}</div>
                </div>
                <div style={{ padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  {[['Role', 'Guest'], ['Protocol', 'WebRTC P2P'], ['Stream', remoteStream ? '● Active' : '○ Waiting'], ['Recording', 'Auto — host triggered']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--tertiary)' }}>{k}</span>
                      <span style={{ fontSize: '0.7rem', color: v.startsWith('●') ? 'var(--green)' : 'var(--text)', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showPanel === 'status' && (
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--tertiary)', marginBottom: '1rem' }}>Status</div>
                <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: 'var(--surface2)', border: `1px solid ${isRecording ? 'rgba(255,55,95,0.2)' : 'var(--border)'}`, borderRadius: 12, marginBottom: '1rem' }}>
                  {!remoteStream && <><div style={{ width: 28, height: 28, border: '3px solid var(--tertiary)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} /><div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--tertiary)' }}>Waiting</div></>}
                  {remoteStream && !isRecording && !loaderStopRecording && <><div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '0.25rem' }}>Live</div><div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Stream connected</div></>}
                  {isRecording && <><div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent)', animation: 'pulse 2s ease-in-out infinite', marginBottom: '0.25rem' }}>● REC</div><div style={{ fontFamily: 'var(--mono)', fontSize: '1.1rem', fontWeight: 600 }}>{formatDuration(recordingDuration)}</div></>}
                  {loaderStopRecording && <><div style={{ width: 28, height: 28, border: '3px solid var(--amber)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 0.75rem' }} /><div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--amber)' }}>Uploading</div></>}
                </div>
                {[{ label: 'WebSocket', ok: isConnected }, { label: 'Host stream', ok: !!remoteStream }, { label: 'Own camera', ok: !!localStreamRef.current }, { label: 'Recording', ok: isRecording }, { label: 'Complete', ok: !!videoUrl }].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{s.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.ok ? 'var(--green)' : 'var(--tertiary)' }} />
                      <span style={{ fontSize: '0.7rem', color: s.ok ? 'var(--green)' : 'var(--tertiary)', fontWeight: 500 }}>{s.ok ? 'OK' : '—'}</span>
                    </div>
                  </div>
                ))}
                {videoUrl && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(48,209,88,0.06)', border: '1px solid rgba(48,209,88,0.15)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--green)', marginBottom: '0.75rem' }}>Recording complete</div>
                    <video src={videoUrl} controls style={{ width: '100%', borderRadius: 8, marginBottom: '0.75rem', background: '#000' }} />
                    <button onClick={downloadVideo} style={{
                      width: '100%', padding: '9px', background: 'rgba(48,209,88,0.1)',
                      border: '1px solid rgba(48,209,88,0.2)', borderRadius: 8, cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 600, color: 'var(--green)', fontFamily: 'var(--font)',
                    }}>↓ Download Recording</button>
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
