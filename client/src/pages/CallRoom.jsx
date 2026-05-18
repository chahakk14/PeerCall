import { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket.js";
import { useLocalMedia } from "../hooks/useLocalMedia.js";
import { useWebRTC } from "../hooks/useWebRTC.js";
import VideoTile from "../components/VideoTile.jsx";
import Controls from "../components/Controls.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import ParticipantPanel from "../components/ParticipantPanel.jsx";

export default function CallRoom({ roomId, displayName, audioEnabled = true, videoEnabled = true, audioDeviceId, videoDeviceId, onLeave }) {
  const { socketRef, connected } = useSocket();
  const {
    stream: localStream,
    audio, video, error: mediaError,
    isScreenSharing,
    toggleAudio, toggleVideo,
    startScreenShare, stopScreenShare,
  } = useLocalMedia({ audioEnabled, videoEnabled, audioDeviceId, videoDeviceId });

  const { remoteStreams, peerStates } = useWebRTC({
    socketRef, roomId, displayName, localStream,
  });

  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [speakingMap, setSpeakingMap] = useState({}); // { id: rms }
  const audioCtxRef = useRef(null);
  const analyserRefs = useRef({});
  const rafRef = useRef(null);

  // Notify peers when media state changes
  useEffect(() => {
    if (socketRef.current && localStream) {
      socketRef.current.emit("media-state", { roomId, audio, video });
    }
  }, [audio, video, roomId, socketRef, localStream]);

  // Gather senders for screen share track replacement
  function getSenders() {
    // Not directly accessible here — screen share track replacement
    // is handled inside useLocalMedia when senders are passed.
    // For a real app, expose peersRef from useWebRTC.
    return [];
  }

  function handleToggleScreen() {
    if (isScreenSharing) {
      stopScreenShare(getSenders());
    } else {
      startScreenShare(getSenders());
    }
  }

  function handleLeave() {
    socketRef.current?.disconnect();
    localStream?.getTracks().forEach((t) => t.stop());
    onLeave();
  }

  // Speaking detection using WebAudio AnalyserNodes for local + remote streams
  useEffect(() => {
    const audioCtx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    const currentIds = new Set();

    function ensureAnalyser(id, stream) {
      if (!stream) return;
      currentIds.add(id);
      const existing = analyserRefs.current[id];
      if (existing && existing.stream === stream) return; // same stream

      // clean existing if stream changed
      if (existing) {
        try { existing.source.disconnect(); } catch (e) {}
      }

      try {
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        const dataArray = new Uint8Array(analyser.fftSize);
        source.connect(analyser);
        analyserRefs.current[id] = { source, analyser, dataArray, stream };
      } catch (err) {
        // ignore if stream not allowed or already in use
        console.warn('Analyser setup failed for', id, err);
      }
    }

    // setup local
    if (localStream) ensureAnalyser('local', localStream);

    // setup remotes
    for (const { socketId, stream } of remoteStreams) {
      ensureAnalyser(socketId, stream);
    }

    // remove analysers for streams no longer present
    for (const id of Object.keys(analyserRefs.current)) {
      if (!currentIds.has(id)) {
        try { analyserRefs.current[id].source.disconnect(); } catch (e) {}
        delete analyserRefs.current[id];
      }
    }

    let mounted = true;

    function tick() {
      const newMap = {};
      for (const id of Object.keys(analyserRefs.current)) {
        const { analyser, dataArray } = analyserRefs.current[id];
        try {
          analyser.getByteTimeDomainData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const n = (dataArray[i] - 128) / 128;
            sum += n * n;
          }
          const rms = Math.sqrt(sum / dataArray.length);
          newMap[id] = rms;
        } catch (err) {
          newMap[id] = 0;
        }
      }
      if (mounted) setSpeakingMap(newMap);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // disconnect sources but keep AudioContext open
      for (const id of Object.keys(analyserRefs.current)) {
        try { analyserRefs.current[id].source.disconnect(); } catch (e) {}
        delete analyserRefs.current[id];
      }
    };
  }, [localStream, remoteStreams]);

  // Grid layout: 1 col if solo, 2 cols if 2+, up to 3 cols
  const totalTiles = 1 + remoteStreams.length;
  const gridCols = totalTiles === 1 ? 1 : totalTiles <= 4 ? 2 : 3;
  const gridRows = Math.ceil(totalTiles / gridCols);

  if (mediaError) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "1rem", padding: "2rem", textAlign: "center",
      }}>
        <div style={{ fontSize: "18px", color: "var(--red)" }}>Camera/mic access denied</div>
        <p style={{ color: "var(--text2)", maxWidth: "380px" }}>
          PeerCall needs access to your camera and microphone. Please allow access in your
          browser settings and reload the page.
        </p>
        <button
          onClick={onLeave}
          style={{ padding: "10px 20px", background: "var(--bg3)", borderRadius: "8px",
            border: "1px solid var(--border)", color: "var(--text)" }}
        >
          Back to lobby
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px",
        background: "var(--bg2)", borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontWeight: "600", color: "var(--accent2)" }}>PeerCall</span>
          <span style={{
            background: "var(--bg3)", border: "1px solid var(--border)",
            padding: "3px 12px", borderRadius: "999px",
            fontSize: "12px", color: "var(--text2)", fontFamily: "monospace",
          }}>
            {roomId}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
          <div style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: connected ? "var(--green)" : "var(--red)",
          }} />
          <span style={{ color: "var(--text2)" }}>
            {connected ? `${totalTiles} participant${totalTiles !== 1 ? "s" : ""}` : "Reconnecting…"}
          </span>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Video grid */}
        <div style={{
          flex: 1, padding: "12px", overflow: "hidden",
          display: "grid",
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`,
          gap: "10px",
          alignContent: "stretch",
          justifyItems: "stretch",
        }}>
          {/* Local tile */}
          <VideoTile
            stream={localStream}
            displayName={displayName}
            muted
            audioOn={audio}
            videoOn={video}
            isLocal
            isScreenShare={isScreenSharing}
          />

          {/* Remote tiles */}
          {remoteStreams.map(({ socketId, stream, displayName: dn }) => (
            <VideoTile
              key={socketId}
              stream={stream}
              displayName={dn}
              audioOn={peerStates[socketId]?.audio ?? true}
              videoOn={peerStates[socketId]?.video ?? true}
            />
          ))}

          {/* Waiting message removed per user request */}
        </div>

        {/* Right sidebar - Participants or Chat */}
        {(participantsOpen || chatOpen) && (
          <div style={{ display: "flex" }}>
            {participantsOpen && (
              <ParticipantPanel
                displayName={displayName}
                roomId={roomId}
                remoteStreams={remoteStreams}
                peerStates={peerStates}
                speakingMap={speakingMap}
                onClose={() => setParticipantsOpen(false)}
              />
            )}
            {chatOpen && !participantsOpen && (
              <ChatPanel socketRef={socketRef} roomId={roomId} displayName={displayName} />
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <Controls
        audio={audio}
        video={video}
        isScreenSharing={isScreenSharing}
        chatOpen={chatOpen}
        participantsOpen={participantsOpen}
        isSpeaking={speakingMap.local > 0.02}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreen={handleToggleScreen}
        onToggleChat={() => setChatOpen((v) => !v)}
        onToggleParticipants={() => setParticipantsOpen((v) => !v)}
        onLeave={handleLeave}
      />
    </div>
  );
}
