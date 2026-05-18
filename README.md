# 📹 PeerCall — WebRTC Peer-to-Peer Video Calling App

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat&logo=socket.io)
![WebRTC](https://img.shields.io/badge/WebRTC-P2P-333333?style=flat&logo=webrtc)

A production-quality, real-time video calling web app built from scratch using **WebRTC**, **React**, and **Node.js**. Video and audio stream **directly between browsers (peer-to-peer)** — the server only brokers the initial connection handshake and never touches your media.

---

## ✨ Features

- 🎥 **Peer-to-peer video & audio** — direct browser-to-browser using WebRTC `RTCPeerConnection`
- 🔇 **Mute / camera toggle** — instantly via `track.enabled`, no renegotiation
- 🖥️ **Screen sharing** — swap tracks live with `RTCRtpSender.replaceTrack()`
- 💬 **In-call text chat** — real-time via Socket.io
- 👥 **Multi-user rooms** — mesh topology, one connection per remote peer
- 🌐 **NAT traversal** — STUN servers for cross-network calls (TURN-ready)
- 🔗 **Shareable room codes** — no sign-up required, just share a code
- 📱 **Responsive UI** — works on desktop and mobile browsers
- 🐳 **Docker support** — one-command server deployment

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | UI, component architecture |
| P2P Media | WebRTC API | Audio/video streaming |
| Signaling | Node.js + Socket.io | SDP & ICE exchange |
| NAT Traversal | STUN (Google) | Cross-network connectivity |
| Styling | Vanilla CSS (CSS vars) | Theming, dark UI |
<!--| Deployment | Vercel + Railway | Client + server hosting | -->

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Signaling Server                    │
│              Node.js + Socket.io + Express              │
│         (SDP offer/answer · ICE candidates · Chat)      │
└───────────────────────┬─────────────────────────────────┘
          ▲ Socket.io   │   Socket.io ▲
          │  (signaling)│  (signaling)│
          │             │             │
   ┌──────┴──────┐      │      ┌──────┴──────┐
   │   Peer A    │      │      │   Peer B    │
   │  (Browser)  │      │      │  (Browser)  │
   │  React App  │◄─────┼─────►│  React App  │
   └─────────────┘      │      └─────────────┘
         ▲              │              ▲
         │   WebRTC P2P media stream   │
         └────────────────────────────┘
              (audio + video — direct,
               server never sees this)
```

**How a call is established:**
1. Both peers connect to the signaling server via Socket.io
2. Peer A calls `createOffer()` → sends SDP to Peer B via server
3. Peer B receives offer → calls `createAnswer()` → sends back
4. Both peers exchange ICE candidates (network addresses) via server
5. WebRTC picks the best path and opens a **direct P2P connection**
6. Media flows — the server is no longer involved

---

## 📁 Project Structure

```
webrtc-app/
├── server/
│   ├── index.js              # Signaling server (Socket.io)
│   ├── package.json
│   ├── Dockerfile
│   ├── .env.example
│   └── .env                  # ← not committed
│
├── client/
│   ├── src/
│   │   ├── hooks/
│   │   │   ├── useSocket.js      # Socket.io connection lifecycle
│   │   │   ├── useLocalMedia.js  # Camera/mic, screen share
│   │   │   └── useWebRTC.js      # RTCPeerConnection per peer (core)
│   │   ├── components/
│   │   │   ├── VideoTile.jsx     # Single participant video
│   │   │   ├── Controls.jsx      # Mute / video / screen / chat / leave
│   │   │   └── ChatPanel.jsx     # Slide-in chat panel
│   │   ├── pages/
│   │   │   ├── Lobby.jsx         # Room join / create UI
│   │   │   └── CallRoom.jsx      # Active call view
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── .env                  # ← not committed
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- **Node.js 18+** and npm
- Two browser windows or devices for testing

### 1. Clone the repo

```bash
git clone https://github.com/chahakk14/peercall.git
cd peercall
```

### 2. Set up environment variables

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

Default values work out of the box for local development.

### 3. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 4. Run the app

Open **two terminals:**

```bash
# Terminal 1 — signaling server (http://localhost:3001)
cd server && npm run dev

# Terminal 2 — React client (http://localhost:5173)
cd client && npm run dev
```

Open `http://localhost:5173` in **two browser tabs**, enter a name, use the same room code in both, and join.

---

## 🐳 Docker Setup

Run the signaling server with Docker Compose:

```bash
docker compose up --build
```

Then run the React client separately:

```bash
cd client && npm run dev
```

---


## 🔧 Environment Variables

### Server (`server/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Port the signaling server listens on |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin (your frontend URL) |

### Client (`client/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_SERVER_URL` | `http://localhost:3001` | Signaling server URL |

---

## 📡 Adding a TURN Server (Cross-Network Calls)

By default, the app uses Google's free STUN servers. For calls across strict NATs (mobile networks, office firewalls), you need a **TURN relay**.

**Option A — Free dev TURN** via [Metered.ca Open Relay](https://www.metered.ca/tools/openrelay/)

**Option B — Self-host Coturn:**

```bash
# Ubuntu VPS
sudo apt install coturn

# /etc/coturn/turnserver.conf
listening-port=3478
fingerprint
lt-cred-mech
user=myuser:mypassword
realm=yourdomain.com
```

Then add to `client/src/hooks/useWebRTC.js`:

```js
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:yourdomain.com:3478",
      username: "myuser",
      credential: "mypassword",
    },
  ],
};
```

---

## 🔮 Roadmap / Planned Features

- [ ] **SFU architecture** (mediasoup) for rooms with 5+ participants
- [ ] **Recording** via `MediaRecorder` + S3 storage
- [ ] **Adaptive bitrate** using `RTCPeerConnection.getStats()`
- [ ] **End-to-end encryption** with Insertable Streams API
- [ ] **Room authentication** via JWT
- [ ] **Virtual backgrounds** using TensorFlow.js body segmentation
- [ ] **P2P chat** via `RTCDataChannel` (zero server round-trip)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

```bash
# Fork → clone → branch
git checkout -b feature/your-feature

# Make changes, then
git commit -m "feat: your feature description"
git push origin feature/your-feature
# Open a PR
```

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@chahakk14](https://github.com/chahakk14)
- LinkedIn: [linkedin.com/in/chahakkhandelwal](https://linkedin.com/in/chahakkhandelwal)

---

<p align="center">
  Built to learn WebRTC, React, and real-time systems.<br/>
  If this helped you, consider giving it a ⭐
</p>
