import { useState } from "react";

export default function ParticipantPanel({ 
  displayName, 
  roomId,
  remoteStreams, 
  peerStates,
  speakingMap = {},
  onClose,
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  function handleSendInvite() {
    setInviteError("");
    setInviteStatus("");
    const email = inviteEmail.trim();
    if (!email) {
      return setInviteError("Enter a Gmail address to send the invite.");
    }
    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
      return setInviteError("Please use a valid gmail.com address.");
    }
    const subject = `Join my PeerCall meeting`;
    const body = `Hi,\n\nJoin my PeerCall meeting using this room code: ${roomId}\n\nOpen the app and enter the code to join.\n\nThanks!`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, "_blank");
    setInviteStatus("Gmail compose opened in a new tab. Send the invite from Gmail.");
    setInviteEmail("");
  }

  return (
    <div style={{
      width: "280px",
      background: "var(--bg2)",
      borderLeft: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        padding: "12px 16px",
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: "600", fontSize: "13px", color: "var(--text)" }}>
          Participants ({1 + remoteStreams.length})
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--text2)",
            cursor: "pointer",
            fontSize: "18px",
            padding: "0",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
      </div>

      <div style={{
        padding: "12px 16px",
        
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
      }}>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          style={{
            padding: "8px 12px",
            borderRadius: "999px",
            background: "var(--bg3)",
            color: "var(--text)",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Add people
        </button>
      </div>

      {/* Participants list */}
      <div style={{
        flex: 1,
        overflowY: "auto",
      }}>
        {/* Local user */}
        <div style={{
          padding: "10px 16px",
          border: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "600",
            color: "#fff",
            flexShrink: 0,
          }}>
            {displayName?.charAt(0)?.toUpperCase() || "Y"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "13px",
              fontWeight: "500",
              color: "var(--text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {displayName || "You"} <span style={{ color: "var(--text2)" }}>(you)</span>
            </div>
            <div style={{
              fontSize: "11px",
              color: speakingMap.local > 0.02 ? "var(--green)" : "var(--text2)",
              marginTop: "3px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: speakingMap.local > 0.02 ? "var(--green)" : "transparent",
                boxShadow: speakingMap.local > 0.02 ? "0 0 6px rgba(29,158,117,0.6)" : "none",
                transition: "background 120ms, box-shadow 120ms",
                display: "inline-block",
              }} />
              <span>{speakingMap.local > 0.02 ? 'Speaking' : 'Connected'}</span>
            </div>
          </div>
        </div>

        {/* Remote participants */}
        {remoteStreams.map(({ socketId, displayName: dn }) => {
          const peerState = peerStates[socketId] || {};
          return (
            <div
              key={socketId}
              style={{
                padding: "10px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--accent2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "600",
                color: "#fff",
                flexShrink: 0,
              }}>
                {dn?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "var(--text)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {dn || "Unknown"}
                </div>
                <div style={{
                  fontSize: "11px",
                  color: "var(--text2)",
                  marginTop: "3px",
                  display: "flex",
                  gap: "8px",
                }}>
                  {peerState.audio !== false && (
                    <span title="Microphone on">🎤</span>
                  )}
                  {speakingMap[socketId] > 0.02 && (
                    <span title="Speaking" style={{ color: "var(--green)" }}>●</span>
                  )}
                  {peerState.video !== false && (
                    <span title="Camera on">📹</span>
                  )}
                  {peerState.audio === false && peerState.video === false && (
                    <span style={{ color: "var(--amber)" }}>muted</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* No remote participants
        {remoteStreams.length === 0 && (
          <div style={{
            padding: "20px 16px",
            textAlign: "center",
            color: "var(--text2)",
            fontSize: "12px",
          }}>
            Waiting for others to join...
          </div>
        )} */}
      </div>

      {inviteOpen && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          zIndex: 10,
        }}>
          <div style={{
            width: "100%",
            maxWidth: "360px",
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1.5rem",
            boxSizing: "border-box",
            position: "relative",
          }}>
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
              style={{
                position: "absolute",
                right: "12px",
                top: "12px",
                border: "none",
                background: "transparent",
                color: "var(--text2)",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text)" }}>
              Invite people
            </div>
            <div style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "1rem" }}>
              Enter a Gmail address to send an invite link.
            </div>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="friend@gmail.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                background: "var(--bg3)",
                color: "var(--text)",
                marginBottom: "1rem",
              }}
            />
            <button
              type="button"
              onClick={handleSendInvite}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Send invite via Gmail
            </button>
            {inviteError && (
              <div style={{ fontSize: "12px", color: "var(--red)", marginTop: "0.75rem" }}>{inviteError}</div>
            )}
            {inviteStatus && (
              <div style={{ fontSize: "12px", color: "var(--green)", marginTop: "0.75rem" }}>{inviteStatus}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
