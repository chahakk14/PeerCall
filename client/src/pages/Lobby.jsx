import { useEffect, useRef, useState } from "react";

const styles = {
  page: {
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg)",
    padding: "0",
    boxSizing: "border-box",
  },
  container: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem 0",
    overflow: "hidden",
  },
  layout: {
    display: "flex",
    overflow: "hidden",
    gap: "1.5rem",
    alignItems: "center",
    width: "100%",
    maxWidth: "1120px",
    flexWrap: "wrap",
  },
  header: {
    width: "100%",
    height: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg2)",
    borderBottom: "1px solid var(--border)",
    padding: "0 1rem",
    boxSizing: "border-box",
  },
  headerLogo: {
    fontSize: "22px",
    fontWeight: "700",
    color: "var(--accent2)",
  },
  previewCard: {
    flex: "1 1 360px",
    minWidth: "320px",
    minHeight: "0",
    height: "auto",
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    overflowY: "auto",
  },
  card: {
    flex: "0 0 420px",
    minWidth: "320px",
    minHeight: "0",
    height: "auto",
    maxHeight: "calc(100vh - 140px)",
    alignSelf: "center",
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "2.5rem 2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    overflowY: "auto",
  },
  logo: {
    fontSize: "28px",
    fontWeight: "600",
    color: "var(--accent2)",
    marginBottom: "6px",
    letterSpacing: "-0.5px",
    textAlign: "center",
  },
  subtitle: { color: "var(--text2)", marginBottom: "2rem", fontSize: "14px", textAlign: "center" },
  label: { display: "block", color: "var(--text2)", marginBottom: "6px", fontSize: "13px" },
  input: {
    width: "100%",
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text)",
    padding: "10px 14px",
    marginBottom: "1rem",
  },
  select: {
    width: "100%",
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text)",
    padding: "10px 14px",
    marginBottom: "1rem",
  },
  row: { display: "flex", gap: "8px", marginBottom: "1.5rem" },
  btn: {
    flex: 1,
    padding: "10px",
    borderRadius: "var(--radius-sm)",
    fontWeight: "500",
    fontSize: "13px",
  },
  btnPrimary: {
    background: "var(--accent)",
    color: "#fff",
  },
  btnSecondary: {
    background: "var(--bg3)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  },
  divider: {
    borderTop: "1px solid var(--border)",
  },
  hint: { fontSize: "12px", color: "var(--text2)", lineHeight: "1.6" },
  previewLabel: { fontSize: "12px", color: "var(--text2)", marginBottom: "6px" },
  previewWrapper: {
    position: "relative",
    width: "100%",
    paddingTop: "56.25%",
    minHeight: "220px",
    background: "#000",
    borderRadius: "var(--radius-sm)",
    overflow: "hidden",
  },
  previewVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "var(--radius-sm)",
    background: "#000",
  },
  previewOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "12px",
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    pointerEvents: "none",
  },
  previewButton: {
    pointerEvents: "auto",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  previewButtonOff: {
    background: "rgba(226,75,74,0.85)",
    border: "1px solid rgba(226,75,74,0.9)",
  },
  previewButtonOn: {
    background: "rgba(29,158,117,0.85)",
    border: "1px solid rgba(29,158,117,0.9)",
  },
  fieldGroupSettings: {
    display: "flex",
    gap: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  modeToggle: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: "999px",
    padding: "4px",
  },
  modeButton: {
    flex: 1,
    border: "none",
    borderRadius: "999px",
    padding: "10px 14px",
    background: "transparent",
    color: "var(--text2)",
    cursor: "pointer",
    fontWeight: 500,
  },
  modeButtonActive: {
    background: "var(--bg)",
    color: "var(--text)",
    boxShadow: "0 0 0 1px var(--border)",
  },
};

function randomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

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

function CameraIcon({ on }) {
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

export default function Lobby({ onJoin }) {
  const [mode, setMode] = useState("join");
  const [roomId, setRoomId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [devices, setDevices] = useState({ audioIn: [], videoIn: [], audioOut: [] });
  const [selectedAudioIn, setSelectedAudioIn] = useState("");
  const [selectedVideoIn, setSelectedVideoIn] = useState("");
  const [selectedAudioOut, setSelectedAudioOut] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const previewStreamRef = useRef(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    async function loadDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        // ignore, device list may still be available
      }

      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const audioIn = allDevices.filter((d) => d.kind === "audioinput");
        const videoIn = allDevices.filter((d) => d.kind === "videoinput");
        const audioOut = allDevices.filter((d) => d.kind === "audiooutput");
        setDevices({ audioIn, videoIn, audioOut });
        if (!selectedAudioIn && audioIn.length > 0) setSelectedAudioIn(audioIn[0].deviceId);
        if (!selectedVideoIn && videoIn.length > 0) setSelectedVideoIn(videoIn[0].deviceId);
        if (!selectedAudioOut && audioOut.length > 0) setSelectedAudioOut(audioOut[0].deviceId);
      } catch (err) {
        console.error("Device enumeration failed", err);
      }
    }

    loadDevices();
  }, []);

  useEffect(() => {
    async function updatePreview() {
      if (!videoEnabled && !audioEnabled) {
        if (previewStreamRef.current) {
          previewStreamRef.current.getTracks().forEach((track) => track.stop());
          previewStreamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        return;
      }
      if (!selectedVideoIn && !selectedAudioIn) return;
      setLoadingPreview(true);
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach((track) => track.stop());
        previewStreamRef.current = null;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled
            ? selectedVideoIn
              ? { deviceId: { exact: selectedVideoIn } }
              : true
            : false,
          audio: audioEnabled
            ? selectedAudioIn
              ? { deviceId: { exact: selectedAudioIn } }
              : true
            : false,
        });

        if (!videoEnabled) {
          stream.getVideoTracks().forEach((track) => (track.enabled = false));
        }
        if (!audioEnabled) {
          stream.getAudioTracks().forEach((track) => (track.enabled = false));
        }

        previewStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Preview setup failed", err);
      } finally {
        setLoadingPreview(false);
      }
    }

    updatePreview();
    return () => {
      previewStreamRef.current?.getTracks().forEach((track) => track.stop());
      previewStreamRef.current = null;
    };
  }, [selectedVideoIn, selectedAudioIn, videoEnabled, audioEnabled]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (selectedAudioOut && typeof videoRef.current.setSinkId === "function") {
      videoRef.current.setSinkId(selectedAudioOut).catch((err) => {
        console.warn("setSinkId failed", err);
      });
    }
  }, [selectedAudioOut]);

  function handleModeChange(selectedMode) {
    setMode(selectedMode);
    setError("");
    if (selectedMode === "create") {
      setRoomId("");
    }
  }

  function handleJoin() {
    const name = displayName.trim();
    const room = roomId.trim().toUpperCase();
    if (!name) return setError("Please enter your name.");
    if (!room) return setError("Please enter a room code.");
    setError("");
    onJoin(room, name, {
      audioEnabled,
      videoEnabled,
      audioDeviceId: selectedAudioIn,
      videoDeviceId: selectedVideoIn,
    });
  }

  function handleCreate() {
    const name = displayName.trim();
    if (!name) return setError("Please enter your name first.");
    setError("");
    onJoin(randomId(), name, {
      audioEnabled,
      videoEnabled,
      audioDeviceId: selectedAudioIn,
      videoDeviceId: selectedVideoIn,
    });
  }

  function handleKey(e) {
    if (e.key === "Enter") {
      if (mode === "create") {
        handleCreate();
      } else {
        handleJoin();
      }
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLogo}>PeerCall</div>
      </div>
      <div style={styles.container}>
      <div style={styles.layout}>
        <div style={styles.previewCard}>
          <div style={{ fontSize: "20px", fontWeight: "600", color: "var(--text)", marginBottom: "10px" }}>
            Preview
          </div>
          <div style={styles.previewWrapper}>
            <video
              ref={videoRef}
              style={styles.previewVideo}
              autoPlay
              playsInline
              muted
            />
            <div style={styles.previewOverlay}>
              <button
                type="button"
                aria-label={audioEnabled ? "Microphone on" : "Microphone off"}
                style={{
                  ...styles.previewButton,
                  ...(audioEnabled ? styles.previewButtonOn : styles.previewButtonOff),
                }}
                onClick={() => setAudioEnabled((prev) => !prev)}
              >
                <MicIcon on={audioEnabled} />
              </button>
              <button
                type="button"
                aria-label={videoEnabled ? "Camera on" : "Camera off"}
                style={{
                  ...styles.previewButton,
                  ...(videoEnabled ? styles.previewButtonOn : styles.previewButtonOff),
                }}
                onClick={() => setVideoEnabled((prev) => !prev)}
              >
                <CameraIcon on={videoEnabled} />
              </button>
            </div>
          </div>
          <div style={styles.fieldGroupSettings}>
            <div>
              <div style={styles.previewLabel}>Camera</div>
              <select
                style={styles.select}
                value={selectedVideoIn}
                onChange={(e) => setSelectedVideoIn(e.target.value)}
              >
                {devices.videoIn.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || "Camera"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={styles.previewLabel}>Microphone</div>
              <select
                style={styles.select}
                value={selectedAudioIn}
                onChange={(e) => setSelectedAudioIn(e.target.value)}
              >
                {devices.audioIn.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || "Microphone"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={styles.previewLabel}>Audio output</div>
              <select
                style={styles.select}
                value={selectedAudioOut}
                onChange={(e) => setSelectedAudioOut(e.target.value)}
              >
                {devices.audioOut.length > 0 ? (
                  devices.audioOut.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || "Speaker"}
                    </option>
                  ))
                ) : (
                  <option value="">Default</option>
                )}
              </select>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.modeToggle}>
            <button
              type="button"
              style={{
                ...styles.modeButton,
                ...(mode === "join" ? styles.modeButtonActive : {}),
              }}
              onClick={() => handleModeChange("join")}
            >
              Join meeting
            </button>
            <button
              type="button"
              style={{
                ...styles.modeButton,
                ...(mode === "create" ? styles.modeButtonActive : {}),
              }}
              onClick={() => handleModeChange("create")}
            >
              Create meeting
            </button>
          </div>

          <div style={styles.fieldGroup}>
            <div>
              <label style={styles.label}>Your name</label>
              <input
                style={styles.input}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ada Lovelace"
                autoFocus
                onKeyDown={handleKey}
              />
            </div>

            {mode === "join" && (
              <div>
                <label style={styles.label}>Room code</label>
                <input
                  style={styles.input}
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  onKeyDown={handleKey}
                />
              </div>
            )}
          </div>

          {error && (
            <p style={{ color: "var(--red)", fontSize: "13px", marginBottom: "1rem" }}>{error}</p>
          )}

          <div style={styles.row}>
            <button
              style={{ ...styles.btn, ...styles.btnPrimary }}
              onClick={mode === "create" ? handleCreate : handleJoin}
            >
              {mode === "create" ? "Create room" : "Join room"}
            </button>
          </div>

          <div style={styles.divider} />
          <p style={styles.hint}>
            Share the room code with anyone you want to call. Video and audio stream
            directly peer-to-peer — your server never sees the media.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
