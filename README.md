# PeerCall — WebRTC Peer-to-Peer Video Calling App

A production-quality video calling app built with React, Node.js, Socket.io, and WebRTC.
Video and audio stream **directly between browsers** — your server only handles signaling.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Signaling server | Node.js, Express, Socket.io |
| P2P media | WebRTC (RTCPeerConnection, getUserMedia) |
| NAT traversal | STUN (Google), TURN (Coturn — optional) |
| Deployment | Vercel (client) + Railway/Render (server) |

---

## Project Structure

```
webrtc-app/
├── server/
│   ├── index.js          # Signaling server (Socket.io)
│   ├── package.json
│   ├── Dockerfile
│   └── .env
├── client/
│   ├── src/
│   │   ├── hooks/
│   │   │   ├── useSocket.js      # Socket.io connection
│   │   │   ├── useLocalMedia.js  # Camera/mic access
│   │   │   └── useWebRTC.js      # Peer connections (core logic)
│   │   ├── components/
│   │   │   ├── VideoTile.jsx     # Individual video stream
│   │   │   ├── Controls.jsx      # Mute/video/screen controls
│   │   │   └── ChatPanel.jsx     # In-call text chat
│   │   ├── pages/
│   │   │   ├── Lobby.jsx         # Room join page
│   │   │   └── CallRoom.jsx      # Active call view
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── .env
└── docker-compose.yml
```

---

## Local Setup

### Prerequisites
- Node.js 18+ and npm
- Two browser windows (or two devices on same network) for testing

### Step 1 — Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### Step 2 — Configure environment

Server (`server/.env`):
```
PORT=3001
CLIENT_URL=http://localhost:5173
```

Client (`client/.env`):
```
VITE_SERVER_URL=http://localhost:3001
```

### Step 3 — Run the servers

Open two terminals:

```bash
# Terminal 1 — signaling server
cd server && npm run dev

# Terminal 2 — React client
cd client && npm run dev
```

Open `http://localhost:5173` in **two browser tabs** (or different browsers).
Enter a name in each, use the same room code, and click Join.

---

## Docker Setup (server only)

```bash
# From project root
docker compose up --build
```

The signaling server runs on port 3001. Run the React client separately with `npm run dev`.

---

## Feature Overview

| Feature | How it works |
|---|---|
| Video/audio call | WebRTC `RTCPeerConnection` with `getUserMedia` |
| Mute / camera off | `track.enabled = false` — no renegotiation |
| Screen sharing | `getDisplayMedia()` + `RTCRtpSender.replaceTrack()` |
| In-call chat | Socket.io server relay (upgrade to `RTCDataChannel` for P2P) |
| Multi-user | Mesh topology — one `RTCPeerConnection` per remote peer |
| NAT traversal | Google STUN servers (free); add TURN for strict NAT |

---

## Adding a TURN Server (for cross-network calls)

For calls that cross different networks (e.g. office NAT, mobile), you need a TURN relay.

**Option A — Free (dev only):** Use [Metered.ca](https://www.metered.ca/tools/openrelay/) free TURN.

**Option B — Self-hosted Coturn (production):**

```bash
# On a VPS (Ubuntu)
apt install coturn
```

`/etc/coturn/turnserver.conf`:
```
listening-port=3478
fingerprint
lt-cred-mech
user=myuser:mypassword
realm=yourdomain.com
```

Then in `client/src/hooks/useWebRTC.js`, add to `ICE_SERVERS`:
```js
{ urls: "turn:yourdomain.com:3478", username: "myuser", credential: "mypassword" }
```

**Option C — Twilio Network Traversal Service** (managed, free tier available).

---

## Deployment

### Client → Vercel

```bash
cd client
npm run build
# Push to GitHub, connect repo in Vercel dashboard
# Set VITE_SERVER_URL=https://your-server.railway.app in Vercel env vars
```

### Server → Railway

1. Push `server/` to a GitHub repo
2. Create a new project in [Railway](https://railway.app)
3. Set env vars: `PORT=3001`, `CLIENT_URL=https://your-app.vercel.app`
4. Deploy — Railway auto-detects Node.js

---

## Potential Improvements (for resume depth)

- **SFU architecture** — Replace mesh with a Selective Forwarding Unit (mediasoup or LiveKit)
  for calls with 5+ participants. Great system design talking point.
- **Recording** — Use `MediaRecorder` API on a combined stream; store on S3.
- **Adaptive bitrate** — Monitor `RTCPeerConnection.getStats()` and throttle via
  `RTCRtpSender.setParameters()` on poor connections.
- **E2E encryption** — Use `RTCPeerConnection` with `Insertable Streams` API to encrypt
  media before it hits the network.
- **Authentication** — Add JWT-based room auth so only invited users can join.

---

## Key Concepts for MAANG Interviews

**"Walk me through how a call is established"**
1. Both peers connect to the signaling server via Socket.io
2. Peer A creates an `RTCPeerConnection`, calls `createOffer()`, sets it as local description,
   sends the SDP to Peer B via the signaling server
3. Peer B receives the offer, calls `setRemoteDescription()`, creates an answer,
   sends it back
4. Both peers exchange ICE candidates (their network addresses) via the signaling server
5. WebRTC picks the best ICE candidate pair and establishes the direct P2P connection
6. Media flows directly — the signaling server is no longer involved

**"How would you scale this to 1M users?"**
- Replace mesh with an SFU (mediasoup, LiveKit, or AWS Kinesis Video)
- Horizontally scale signaling servers with Redis Pub/Sub for cross-node room state
- Use a CDN-based TURN fleet for geo-distributed relay
- Shard rooms by region to minimize latency
