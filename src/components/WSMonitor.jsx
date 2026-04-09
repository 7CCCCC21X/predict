import { useState, useEffect, useRef, useCallback } from "react";
import { T, mono } from "../theme";
import { Badge } from "./ui";

const toolbarStyle = {
  display: "flex",
  gap: 8,
  marginBottom: 14,
  flexWrap: "wrap",
  alignItems: "center",
};
const inputStyle = {
  flex: 1,
  minWidth: 160,
  padding: "8px 12px",
  background: T.surfaceAlt,
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  color: T.text,
  fontFamily: mono,
  fontSize: 12,
};
const connectBtnStyle = {
  padding: "8px 18px",
  background: T.accentDim,
  border: `1px solid ${T.accent}44`,
  borderRadius: 6,
  color: T.accent,
  fontFamily: mono,
  fontSize: 11,
  cursor: "pointer",
};
const disconnectBtnStyle = {
  padding: "8px 18px",
  background: T.redDim,
  border: `1px solid ${T.red}44`,
  borderRadius: 6,
  color: T.red,
  fontFamily: mono,
  fontSize: 11,
  cursor: "pointer",
};
const clearBtnStyle = {
  padding: "8px 12px",
  background: "transparent",
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  color: T.textDim,
  fontFamily: mono,
  fontSize: 11,
  cursor: "pointer",
};
const logWrapStyle = {
  background: T.bg,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  padding: 12,
  height: 340,
  overflowY: "auto",
  fontFamily: mono,
  fontSize: 10,
  lineHeight: 1.7,
};
const emptyStyle = { color: T.textMuted, textAlign: "center", padding: 40 };
const timeStyle = { color: T.textMuted };
const msgStyle = { color: T.text, wordBreak: "break-all" };

const LC = { system: T.blue, in: T.accent, out: T.yellow, error: T.red };
const WS_URL = "wss://ws.predict.fun/ws";

export default function WSMonitor() {
  const [mktId, setMktId] = useState("mkt_003");
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  const wsRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = useCallback((type, msg) => {
    setLogs((p) => [...p.slice(-150), { type, msg, time: new Date().toLocaleTimeString() }]);
  }, []);

  const teardown = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }, []);

  useEffect(() => () => teardown(), [teardown]);

  const connect = () => {
    if (!mktId) return;
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => {
        setConnected(true);
        addLog("system", "已连接");
        ws.send(
          JSON.stringify({
            method: "subscribe",
            requestId: `sub_${Date.now()}`,
            params: { topics: [`predictOrderbook/${mktId}`] },
          })
        );
        addLog("out", `订阅 predictOrderbook/${mktId}`);
      };
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.method === "heartbeat") {
            ws.send(JSON.stringify({ method: "heartbeat", data: msg.data }));
            return;
          }
          addLog("in", JSON.stringify(msg).slice(0, 400));
        } catch {
          addLog("in", e.data?.slice?.(0, 400) || "binary");
        }
      };
      ws.onclose = () => {
        setConnected(false);
        addLog("system", "已关闭");
      };
      ws.onerror = () => addLog("error", "连接错误");
    } catch (e) {
      addLog("error", e.message);
    }
  };

  const handleDisconnect = () => {
    teardown();
    addLog("system", "已断开");
  };

  return (
    <div>
      <div style={toolbarStyle}>
        <input
          placeholder="Market ID"
          value={mktId}
          onChange={(e) => setMktId(e.target.value)}
          style={inputStyle}
        />
        {!connected ? (
          <button type="button" onClick={connect} style={connectBtnStyle}>
            连接
          </button>
        ) : (
          <button type="button" onClick={handleDisconnect} style={disconnectBtnStyle}>
            断开
          </button>
        )}
        <button type="button" onClick={() => setLogs([])} style={clearBtnStyle}>
          清空
        </button>
        <Badge color={connected ? T.accent : T.red}>{connected ? "LIVE" : "OFFLINE"}</Badge>
      </div>
      <div style={logWrapStyle}>
        {logs.length === 0 && <div style={emptyStyle}>点击连接开始</div>}
        {logs.map((l, i) => (
          <div key={i}>
            <span style={timeStyle}>{l.time}</span>{" "}
            <span style={{ color: LC[l.type] || T.textDim }}>[{l.type}]</span>{" "}
            <span style={msgStyle}>{l.msg}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
