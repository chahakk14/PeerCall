import { useEffect, useRef } from "react";

export default function VideoTile({ stream, displayName, muted = false, audioOn = true, videoOn = true, isLocal = false, isScreenShare = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const initials = displayName
    ? displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div style={{
      position: "relative",
      background: "#111",
      borderRadius: "var(--radius)",
      overflow: "hidden",
      width: "100%",
      height: "100%",
      border: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: isLocal && !isScreenShare ? "scaleX(-1)" : "none", // mirror local camera only
          display: videoOn ? "block" : "none",
        }}
      />

      {/* Avatar when video is off */}
      {!videoOn && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--bg2)",
        }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: "var(--accent)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px", fontWeight: "600",
          }}>
            {initials}
          </div>
        </div>
      )}

      {/* Name tag */}
      <div style={{
        position: "absolute", bottom: "10px", left: "10px",
        background: "rgba(0,0,0,0.6)", color: "#fff",
        fontSize: "12px", fontWeight: "500",
        padding: "3px 10px", borderRadius: "999px",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", gap: "6px",
      }}>
        {isLocal ? `${displayName} (you)` : displayName}
        {!audioOn && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/>
            <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        )}
      </div>

      {/* Local badge */}
      {isLocal && (
        <div style={{
          position: "absolute", top: "10px", right: "10px",
          background: "var(--accent)", color: "#fff",
          fontSize: "11px", padding: "2px 8px", borderRadius: "999px",
        }}>
          You
        </div>
      )}
    </div>
  );
}
