import { useState } from "react";
import Lobby from "./pages/Lobby.jsx";
import CallRoom from "./pages/CallRoom.jsx";

export default function App() {
  const [session, setSession] = useState(null); // { roomId, displayName }

  if (!session) {
    return <Lobby onJoin={(roomId, displayName) => setSession({ roomId, displayName })} />;
  }

  return (
    <CallRoom
      roomId={session.roomId}
      displayName={session.displayName}
      onLeave={() => setSession(null)}
    />
  );
}
