import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../api";
import { T, mono } from "../theme";
import { Spinner, Badge } from "./ui";

const toolbarStyle = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  marginBottom: 16,
  flexWrap: "wrap",
};
const labelStyle = { fontSize: 11, color: T.textDim, fontFamily: mono };
const minInputStyle = {
  width: 80,
  padding: "6px 10px",
  background: T.surfaceAlt,
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  color: T.text,
  fontFamily: mono,
  fontSize: 12,
};
const wrapStyle = { overflowX: "auto" };
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: mono,
  fontSize: 11,
};
const theadRowStyle = { borderBottom: `1px solid ${T.border}` };
const thStyle = {
  padding: "9px 12px",
  textAlign: "left",
  color: T.textDim,
  fontWeight: 500,
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 1,
};
const tdRowStyle = { borderBottom: `1px solid ${T.border}08` };
const timeCellStyle = { padding: "8px 12px", color: T.textMuted, fontSize: 10 };
const mktCellStyle = {
  padding: "8px 12px",
  color: T.text,
  maxWidth: 200,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const sideCellStyle = { padding: "8px 12px" };
const amtCellBase = { padding: "8px 12px", fontWeight: 600 };
const priceCellStyle = { padding: "8px 12px", color: T.yellow };
const addrCellStyle = { padding: "8px 12px", color: T.textDim, fontSize: 10 };
const errorStyle = {
  padding: 12,
  marginBottom: 12,
  background: T.redDim,
  border: `1px solid ${T.red}33`,
  borderRadius: 8,
  fontSize: 11,
  fontFamily: mono,
  color: T.red,
};
const emptyStyle = {
  textAlign: "center",
  padding: 40,
  color: T.textDim,
  fontFamily: mono,
  fontSize: 12,
};

const HEADERS = ["时间", "市场", "方向", "金额", "价格", "交易者"];

export default function OrderFlow() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [min, setMin] = useState(100);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const data = await apiFetch("/v1/orders/matches?limit=100", {
          signal: ctrl.signal,
        });
        if (ctrl.signal.aborted) return;
        setMatches(data.data || (Array.isArray(data) ? data : []));
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(e.message);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const filtered = useMemo(
    () => matches.filter((m) => (m.amount || m.filledAmount || 0) >= min),
    [matches, min]
  );
  const bigCount = useMemo(
    () => matches.filter((m) => (m.amount || m.filledAmount || 0) >= 5000).length,
    [matches]
  );

  return (
    <div>
      <div style={toolbarStyle}>
        <span style={labelStyle}>最低金额 $</span>
        <input
          type="number"
          value={min}
          onChange={(e) => setMin(Number(e.target.value))}
          style={minInputStyle}
        />
        <Badge color={T.yellow}>{bigCount} 大单 (&gt;$5K)</Badge>
        <Badge>{matches.length} 总成交</Badge>
      </div>
      {error && <div style={errorStyle}>加载失败: {error}</div>}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div style={emptyStyle}>{error ? "—" : "暂无成交"}</div>
      ) : (
        <div style={wrapStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRowStyle}>
                {HEADERS.map((h) => (
                  <th key={h} style={thStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => {
                const buy = (m.side || "").toLowerCase().includes("buy");
                const amt = m.amount || m.filledAmount || 0;
                const ts = m.timestamp || m.createdAt;
                const addr = m.taker || m.maker || "";
                return (
                  <tr key={m.id || i} style={tdRowStyle}>
                    <td style={timeCellStyle}>
                      {ts ? new Date(ts).toLocaleTimeString() : "—"}
                    </td>
                    <td style={mktCellStyle}>{m.marketTitle || m.marketId || "—"}</td>
                    <td style={sideCellStyle}>
                      <span style={{ color: buy ? T.accent : T.red, fontWeight: 600 }}>
                        {buy ? "BUY" : "SELL"}
                      </span>
                    </td>
                    <td style={{ ...amtCellBase, color: amt >= 5000 ? T.yellow : T.text }}>
                      ${amt.toLocaleString()}
                    </td>
                    <td style={priceCellStyle}>
                      {m.price != null ? `${(m.price * 100).toFixed(1)}¢` : "—"}
                    </td>
                    <td style={addrCellStyle}>
                      {addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
