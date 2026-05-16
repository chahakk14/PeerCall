import { useEffect, useRef, useState } from "react";

export default function ChatPanel({ socketRef, roomId, displayName }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handler = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat-message", handler);
    return () => socket.off("chat-message", handler);
  }, [socketRef]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const msg = text.trim();
    if (!msg || !socketRef.current) return;
    socketRef.current.emit("chat-message", { roomId, message: msg, displayName });
    setText("");
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      width: "280px", minWidth: "280px",
      background: "var(--bg2)",
      borderLeft: "1px solid var(--border)",
      height: "100%",
    }}>
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--border)",
        fontWeight: "500", fontSize: "13px", color: "var(--text2)",
      }}>
        Chat
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "12px 16px",
        display: "flex", flexDirection: "column", gap: "10px",
      }}>
        {messages.length === 0 && (
          <p style={{ color: "var(--text2)", fontSize: "12px", textAlign: "center", marginTop: "2rem" }}>
            No messages yet
          </p>
        )}
        {messages.map((m, i) => {
          const isMine = m.displayName === displayName;
          return (
            <div key={i} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "90%" }}>
              {!isMine && (
                <div style={{ fontSize: "11px", color: "var(--text2)", marginBottom: "2px" }}>
                  {m.displayName}
                </div>
              )}
              <div style={{
                background: isMine ? "var(--accent)" : "var(--bg3)",
                color: isMine ? "#fff" : "var(--text)",
                padding: "7px 12px", borderRadius: "10px",
                fontSize: "13px", lineHeight: "1.5",
              }}>
                {m.message}
              </div>
              <div style={{ fontSize: "10px", color: "var(--text2)", marginTop: "2px", textAlign: isMine ? "right" : "left" }}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid var(--border)",
        display: "flex", gap: "8px",
      }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message…"
          style={{
            flex: 1, background: "var(--bg3)",
            border: "1px solid var(--border)",
            borderRadius: "8px", padding: "8px 12px",
            color: "var(--text)",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            background: "var(--accent)", color: "#fff",
            border: "none", borderRadius: "8px",
            padding: "8px 14px", fontWeight: "500",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
