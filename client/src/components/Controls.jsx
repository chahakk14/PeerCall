const btnBase = {
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  gap: "4px", padding: "10px 16px",
  borderRadius: "var(--radius-sm)",
  background: "var(--bg3)",
  color: "var(--text)",
  fontSize: "11px", fontWeight: "500",
  minWidth: "64px",
  border: "1px solid var(--border)",
};

const btnOff = {
  ...btnBase,
  background: "rgba(226,75,74,0.15)",
  border: "1px solid rgba(226,75,74,0.3)",
  color: "var(--red)",
};

const btnActive = {
  ...btnBase,
  background: "rgba(127,119,221,0.2)",
  border: "1px solid rgba(127,119,221,0.4)",
  color: "var(--accent2)",
};

const btnDanger = {
  ...btnBase,
  background: "var(--red)",
  color: "#fff",
  border: "none",
};

// Simple SVG icons
function MicIcon({ on }) {
  return on ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
      <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/>
      <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/>
      <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

function VideoIcon({ on }) {
  return on ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34"/>
      <polygon points="23 7 16 12 23 17 23 7"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function ScreenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.68 13.31a16 16 0 003.01 3.01l1.41-1.41a2 2 0 012.18-.43 12.09 12.09 0 003.67 1.22 2 2 0 011.85 2v3.45a2 2 0 01-2.18 1.99 19.79 19.79 0 01-8.63-3.07 19.42 19.42 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3.44a2 2 0 012 1.72 12.09 12.09 0 001.22 3.67 2 2 0 01-.43 2.18L8.92 11"/>
      <line x1="23" y1="1" x2="1" y2="23"/>
    </svg>
  );
}

export default function Controls({
  audio, video, isScreenSharing, chatOpen, participantsOpen, isSpeaking,
  onToggleAudio, onToggleVideo, onToggleScreen, onToggleChat, onToggleParticipants, onLeave,
}) {
  return (
    <div style={{
      display: "flex", gap: "10px",
      alignItems: "center", justifyContent: "center",
      padding: "1rem",
      background: "var(--bg2)",
      borderTop: "1px solid var(--border)",
      flexWrap: "wrap",
    }}>
      <button
        style={
          audio ? ({ ...btnBase, boxShadow: isSpeaking ? "0 0 10px rgba(29,158,117,0.45)" : undefined }) : btnOff
        }
        onClick={onToggleAudio}
      >
        <MicIcon on={audio} />
        {audio ? "Mute" : "Unmuted"}
      </button>

      <button style={video ? btnBase : btnOff} onClick={onToggleVideo}>
        <VideoIcon on={video} />
        {video ? "Camera" : "No cam"}
      </button>

      <button style={isScreenSharing ? btnActive : btnBase} onClick={onToggleScreen}>
        <ScreenIcon />
        {isScreenSharing ? "Stop share" : "Share"}
      </button>

      <button style={participantsOpen ? btnActive : btnBase} onClick={onToggleParticipants}>
        <PeopleIcon />
        People
      </button>

      <button style={chatOpen ? btnActive : btnBase} onClick={onToggleChat}>
        <ChatIcon />
        Chat
      </button>

      <button style={btnDanger} onClick={onLeave}>
        <PhoneIcon />
        Leave
      </button>
    </div>
  );
}
