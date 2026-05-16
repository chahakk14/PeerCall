import { useCallback, useEffect, useRef, useState } from "react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // Add TURN server here for production:
    // { urls: "turn:your-turn-server:3478", username: "user", credential: "pass" }
  ],
};

export function useWebRTC({ socketRef, roomId, displayName, localStream }) {
  // peers: Map<socketId, { pc: RTCPeerConnection, stream: MediaStream }>
  const peersRef = useRef(new Map());
  const [remoteStreams, setRemoteStreams] = useState([]); // [{ socketId, stream, displayName }]
  const [peerStates, setPeerStates] = useState({}); // { socketId: { audio, video } }

  // Keep a ref to displayName to use inside closures
  const displayNameRef = useRef(displayName);
  useEffect(() => { displayNameRef.current = displayName; }, [displayName]);

  const updateRemoteStreams = useCallback(() => {
    const streams = [];
    peersRef.current.forEach((peer, socketId) => {
      if (peer.stream) {
        streams.push({ socketId, stream: peer.stream, displayName: peer.displayName });
      }
    });
    setRemoteStreams([...streams]);
  }, []);

  const createPeerConnection = useCallback((remoteId, remoteDisplayName) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to the connection
    if (localStream) {
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    }

    // Receive remote stream
    const remoteStream = new MediaStream();
    peersRef.current.set(remoteId, { pc, stream: remoteStream, displayName: remoteDisplayName });

    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
      updateRemoteStreams();
    };

    // Send ICE candidates to remote peer
    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", { to: remoteId, candidate: e.candidate });
      }
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      console.log(`[ICE] ${remoteId}: ${state}`);
      if (state === "disconnected" || state === "failed" || state === "closed") {
        peersRef.current.delete(remoteId);
        updateRemoteStreams();
      }
    };

    return pc;
  }, [localStream, socketRef, updateRemoteStreams]);

  // ── Socket event handlers ─────────────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !localStream) return;

    // Existing peers in room when we join → we initiate offers to each
    const handleRoomJoined = async ({ peers }) => {
      for (const peer of peers) {
        const pc = createPeerConnection(peer.socketId, peer.displayName);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: peer.socketId, sdp: offer });
      }
    };

    // A new peer joined → they will send us an offer; update display names
    const handlePeerJoined = ({ socketId, displayName: dn }) => {
      // Pre-register so we have the displayName when offer arrives
      if (!peersRef.current.has(socketId)) {
        peersRef.current.set(socketId, { pc: null, stream: null, displayName: dn });
      }
    };

    // Receive offer → create answer
    const handleOffer = async ({ from, sdp }) => {
      let peer = peersRef.current.get(from);
      let pc;
      if (peer?.pc) {
        pc = peer.pc;
      } else {
        const dn = peer?.displayName || "Peer";
        pc = createPeerConnection(from, dn);
      }
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, sdp: answer });
    };

    // Receive answer
    const handleAnswer = async ({ from, sdp }) => {
      const peer = peersRef.current.get(from);
      if (peer?.pc) {
        await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    };

    // Receive ICE candidate
    const handleIceCandidate = async ({ from, candidate }) => {
      const peer = peersRef.current.get(from);
      if (peer?.pc && candidate) {
        try {
          await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("ICE candidate error:", e);
        }
      }
    };

    // Peer left
    const handlePeerLeft = ({ socketId }) => {
      const peer = peersRef.current.get(socketId);
      if (peer?.pc) peer.pc.close();
      peersRef.current.delete(socketId);
      updateRemoteStreams();
    };

    // Remote media state
    const handlePeerMediaState = ({ socketId, audio, video }) => {
      setPeerStates((prev) => ({ ...prev, [socketId]: { audio, video } }));
    };

    socket.on("room-joined", handleRoomJoined);
    socket.on("peer-joined", handlePeerJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("peer-left", handlePeerLeft);
    socket.on("peer-media-state", handlePeerMediaState);

    // Join the room
    socket.emit("join-room", { roomId, displayName });

    return () => {
      socket.off("room-joined", handleRoomJoined);
      socket.off("peer-joined", handlePeerJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("peer-left", handlePeerLeft);
      socket.off("peer-media-state", handlePeerMediaState);

      // Close all peer connections on unmount
      peersRef.current.forEach(({ pc }) => pc?.close());
      peersRef.current.clear();
      setRemoteStreams([]);
    };
  }, [socketRef, roomId, displayName, localStream, createPeerConnection, updateRemoteStreams]);

  return { remoteStreams, peerStates };
}
