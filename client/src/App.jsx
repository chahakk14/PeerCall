import { useState } from "react";
import Lobby from "./pages/Lobby.jsx";
import CallRoom from "./pages/CallRoom.jsx";

export default function App() {
  const [session, setSession] = useState(null); // { roomId, displayName, audioEnabled, videoEnabled, audioDeviceId, videoDeviceId }

  if (!session) {
    return (
      <Lobby
        onJoin={(roomId, displayName, settings) =>
          setSession({ roomId, displayName, ...settings })
        }
      />
    );
  }

  return (
    <CallRoom
      roomId={session.roomId}
      displayName={session.displayName}
      audioEnabled={session.audioEnabled}
      videoEnabled={session.videoEnabled}
      audioDeviceId={session.audioDeviceId}
      videoDeviceId={session.videoDeviceId}
      onLeave={() => setSession(null)}
    />
  );
}
