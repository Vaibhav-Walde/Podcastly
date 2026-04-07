import { WebSocket, WebSocketServer } from "ws";

interface Sockets {
  sender: WebSocket | null;
  receiver: WebSocket | null;
}

const sessions = new Map<string, Sockets>();
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function newConnection(ws: WebSocket) {
  console.log("New WS connection");
  ws.on("error", console.error);

  ws.on("message", function message(data: any) {
    try {
      const msg = JSON.parse(data);

      if (msg.type === "sender") {
        const roomId = msg.roomId as string;
        // Clean up any previous session with this roomId
        sessions.set(roomId, { sender: ws, receiver: null });
        ws.send(JSON.stringify({ msg: "Connection Established by Sender." }));

      } else if (msg.type === "receiver") {
        const roomId = msg.roomId as string;
        const existingSession = sessions.get(roomId);

        if (!existingSession) {
          ws.send(JSON.stringify({ error: "Session Not Found!" }));
          return;
        }
        if (existingSession.receiver !== null) {
          ws.send(JSON.stringify({ error: "Room is full! Only one guest allowed per session." }));
          return;
        }
        existingSession.receiver = ws;
        ws.send(JSON.stringify({ msg: "Connection Established by Receiver." }));

      } else if (msg.type === "create-offer") {
        const session = getSessionBySocket(ws);
        session?.receiver?.send(JSON.stringify({ type: "sender-remote-description", sdp: msg.sdp }));

      } else if (msg.type === "create-answer") {
        const session = getSessionBySocket(ws);
        session?.sender?.send(JSON.stringify({ type: "receiver-remote-description", sdp: msg.sdp }));

      } else if (msg.type === "sender-iceCandidate") {
        const session = getSessionBySocket(ws);
        session?.receiver?.send(JSON.stringify({ type: "sender-iceCandidate", candidate: msg.candidate }));

      } else if (msg.type === "receiver-iceCandidate") {
        const session = getSessionBySocket(ws);
        session?.sender?.send(JSON.stringify({ type: "receiver-iceCandidate", candidate: msg.candidate }));

      } else if (msg.type === "record-video") {
        const session = getSessionBySocket(ws);
        session?.receiver?.send(JSON.stringify({ type: "start-record", roomId: msg.roomId }));

      } else if (msg.type === "stop-recording") {
        const session = getSessionBySocket(ws);
        session?.receiver?.send(JSON.stringify({ type: "stop-recording", roomId: msg.roomId }));
      }
    } catch (err) {
      console.error("WS message parse error:", err);
      try {
        ws.send(JSON.stringify({ error: "Invalid message format" }));
      } catch (_) {}
    }
  });

  ws.on("close", () => {
    // Clean up the session when sender or receiver disconnects
    for (const [roomId, session] of sessions.entries()) {
      if (session.sender === ws) {
        // Notify receiver that host left
        try {
          session.receiver?.send(JSON.stringify({ type: "host-left" }));
        } catch (_) {}
        sessions.delete(roomId);
        console.log(`Session ${roomId} deleted (sender disconnected)`);
        break;
      } else if (session.receiver === ws) {
        // Just null out the receiver slot so a new receiver can join
        session.receiver = null;
        console.log(`Receiver disconnected from session ${roomId}`);
        break;
      }
    }
  });
});

function getSessionBySocket(ws: WebSocket): Sockets | null {
  for (const [, session] of sessions.entries()) {
    if (session.sender === ws || session.receiver === ws) {
      return session;
    }
  }
  return null;
}

console.log("WebSocket server started on port 8080");