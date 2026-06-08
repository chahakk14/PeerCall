import { useEffect, useRef, useState } from "react";

const COLORS = ["#3f6df8", "#f97316", "#10b981", "#e11d48", "#facc15", "#ffffff"];

function drawOperation(ctx, op) {
  if (!ctx || !op) return;

  if (op.type === "clear") {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }

  ctx.save();
  ctx.strokeStyle = op.color;
  ctx.lineWidth = op.width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(op.from.x, op.from.y);
  ctx.lineTo(op.to.x, op.to.y);
  ctx.stroke();
  ctx.restore();
}

export default function Whiteboard({ socketRef, roomId }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const operationsRef = useRef([]);
  const pointerRef = useRef(null);
  const [toolColor, setToolColor] = useState(COLORS[0]);
  const [penWidth, setPenWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleState = ({ operations = [] }) => {
      operationsRef.current = operations;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = ctxRef.current;
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      for (const op of operationsRef.current) {
        if (op.type === "clear") {
          ctx.clearRect(0, 0, rect.width, rect.height);
        } else {
          drawOperation(ctx, op);
        }
      }
    };

    const handleOperation = (op) => {
      operationsRef.current.push(op);
      const ctx = ctxRef.current;
      if (!ctx) return;
      const canvas = canvasRef.current;
      const rect = canvas?.getBoundingClientRect();
      if (op.type === "clear") {
        if (rect) ctx.clearRect(0, 0, rect.width, rect.height);
        else ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      } else {
        drawOperation(ctx, op);
      }
    };

    socket.on("whiteboard-state", handleState);
    socket.on("whiteboard-operation", handleOperation);
    return () => {
      socket.off("whiteboard-state", handleState);
      socket.off("whiteboard-operation", handleOperation);
    };
  }, [socketRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      // reset any transform then scale to map CSS pixels to device pixels
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const existing = operationsRef.current;
      if (existing.length) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        for (const op of existing) {
          if (op.type === "clear") {
            ctx.clearRect(0, 0, rect.width, rect.height);
          } else {
            drawOperation(ctx, op);
          }
        }
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const emitOperation = (operation) => {
    const socket = socketRef.current;
    if (!socket) return;
    operationsRef.current.push(operation);
    socket.emit("whiteboard-operation", { roomId, operation });
  };

  const getPointerPosition = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    // Prefer offsetX/offsetY when available (more accurate inside the element).
    // Fallback to clientX/clientY relative to bounding rect.
    let x; let y;
    if (typeof event.offsetX === "number" && typeof event.offsetY === "number") {
      x = event.offsetX;
      y = event.offsetY;
    } else {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    // Clamp to canvas bounds
    x = Math.max(0, Math.min(rect.width, x));
    y = Math.max(0, Math.min(rect.height, y));

    return { x, y };
  };

  const startDrawing = (event) => {
    const point = getPointerPosition(event);
    if (!point) return;
    pointerRef.current = point;
    setIsDrawing(true);
    event.target.setPointerCapture?.(event.pointerId);
  };

  const stopDrawing = (event) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    pointerRef.current = null;
    event.target.releasePointerCapture?.(event.pointerId);
  };

  const draw = (event) => {
    if (!isDrawing || !pointerRef.current) return;
    const nextPoint = getPointerPosition(event);
    if (!nextPoint) return;

    const op = {
      type: "stroke",
      color: toolColor,
      width: penWidth,
      from: pointerRef.current,
      to: nextPoint,
    };

    const ctx = ctxRef.current;
    if (ctx) drawOperation(ctx, op);
    emitOperation(op);
    pointerRef.current = nextPoint;
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    operationsRef.current = [];
    const socket = socketRef.current;
    socket?.emit("whiteboard-operation", { roomId, operation: { type: "clear" } });
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      background: "var(--bg2)",
      borderRadius: "var(--radius)",
      border: "1px solid var(--border)",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(255,255,255,0.02)",
      }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <div style={{ fontWeight: 600, color: "var(--text)" }}>Whiteboard</div>
          <div style={{ fontSize: "12px", color: "var(--text2)" }}>Draw together in real time</div>
        </div>
        <button
          onClick={clearBoard}
          style={{
            border: "1px solid var(--border)",
            background: "var(--bg3)",
            color: "var(--text)",
            borderRadius: "10px",
            padding: "8px 12px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Clear board
        </button>
      </div>

      <div style={{ padding: "12px", borderBottom: "1px solid var(--border)", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setToolColor(color)}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "999px",
              border: toolColor === color ? "2px solid var(--accent)" : "1px solid var(--border)",
              background: color,
              cursor: "pointer",
            }}
          />
        ))}
        <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text2)", fontSize: "12px" }}>
          Pen
          <input
            type="range"
            min="1"
            max="12"
            value={penWidth}
            onChange={(e) => setPenWidth(Number(e.target.value))}
            style={{ width: "120px" }}
          />
        </label>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", touchAction: "none", display: "block" }}
          onPointerDown={startDrawing}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
          onPointerMove={draw}
        />
      </div>
    </div>
  );
}
