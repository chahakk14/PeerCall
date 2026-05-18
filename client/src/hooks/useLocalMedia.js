import { useEffect, useRef, useState } from "react";

export function useLocalMedia(options = {}) {
  const [stream, setStream] = useState(null);
  const [audio, setAudio] = useState(options.audioEnabled ?? true);
  const [video, setVideo] = useState(options.videoEnabled ?? true);
  const [error, setError] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const cameraTrackRef = useRef(null);
  const senderRefsRef = useRef([]); // RTCRtpSender refs from peer connections

  useEffect(() => {
    let localStream;

    async function init() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1280,
            height: 720,
            facingMode: "user",
            ...(options.videoDeviceId ? { deviceId: { exact: options.videoDeviceId } } : {}),
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            ...(options.audioDeviceId ? { deviceId: { exact: options.audioDeviceId } } : {}),
          },
        });

        const audioTrack = localStream.getAudioTracks()[0];
        const videoTrack = localStream.getVideoTracks()[0];

        if (audioTrack) {
          audioTrack.enabled = options.audioEnabled ?? true;
        }
        if (videoTrack) {
          videoTrack.enabled = options.videoEnabled ?? true;
          cameraTrackRef.current = videoTrack;
        }

        setStream(localStream);
      } catch (err) {
        setError(err.message);
        console.error("getUserMedia error:", err);
      }
    }

    init();

    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [options.audioEnabled, options.videoEnabled, options.audioDeviceId, options.videoDeviceId]);

  function toggleAudio() {
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setAudio(track.enabled);
    }
  }

  function toggleVideo() {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setVideo(track.enabled);
    }
  }

  async function startScreenShare(senders) {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace the video track in all peer connections
      for (const sender of senders) {
        if (sender.track?.kind === "video") {
          await sender.replaceTrack(screenTrack);
        }
      }

      // Replace in local preview
      const newStream = new MediaStream([
        screenTrack,
        ...stream.getAudioTracks(),
      ]);
      setStream(newStream);
      setIsScreenSharing(true);

      // When user stops via browser UI
      screenTrack.onended = () => stopScreenShare(senders, screenTrack);
    } catch (err) {
      console.error("Screen share error:", err);
    }
  }

  async function stopScreenShare(senders, screenTrack) {
    screenTrack?.stop();
    const cameraTrack = cameraTrackRef.current;

    for (const sender of senders) {
      if (sender.track?.kind === "video") {
        await sender.replaceTrack(cameraTrack);
      }
    }

    const newStream = new MediaStream([
      cameraTrack,
      ...stream.getAudioTracks(),
    ]);
    setStream(newStream);
    setIsScreenSharing(false);
  }

  return {
    stream,
    audio,
    video,
    error,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  };
}
