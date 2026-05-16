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

export default function Lobby({ onJoin }) {
  const [mode, setMode] = useState("join");
  const [roomId, setRoomId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [devices, setDevices] = useState({ audioIn: [], videoIn: [], audioOut: [] });
  const [selectedAudioIn, setSelectedAudioIn] = useState("");
  const [selectedVideoIn, setSelectedVideoIn] = useState("");
  const [selectedAudioOut, setSelectedAudioOut] = useState("");
  const [previewStream, setPreviewStream] = useState(null);
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
      if (!selectedVideoIn && !selectedAudioIn) return;
      setLoadingPreview(true);
      if (previewStream) {
        previewStream.getTracks().forEach((track) => track.stop());
        setPreviewStream(null);
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedVideoIn ? { deviceId: { exact: selectedVideoIn } } : true,
          audio: selectedAudioIn ? { deviceId: { exact: selectedAudioIn } } : true,
        });
        setPreviewStream(stream);
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
      previewStream?.getTracks().forEach((track) => track.stop());
    };
  }, [selectedVideoIn, selectedAudioIn]);

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
    onJoin(room, name);
  }

  function handleCreate() {
    const name = displayName.trim();
    if (!name) return setError("Please enter your name first.");
    setError("");
    onJoin(randomId(), name);
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
          {loadingPreview && (
            <div style={{ color: "var(--text2)", fontSize: "13px" }}>Loading preview…</div>
          )}
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
