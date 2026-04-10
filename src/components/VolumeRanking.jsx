import { useState, useEffect, useMemo } from "react";
import { apiFetch, unwrapList } from "../api";
import { T, mono } from "../theme";
import { Spinner, Badge } from "./ui";

const wrapStyle = { overflowX: "auto" };
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: mono,
  fontSize: 12,
};
const theadRowStyle = { borderBottom: `1px solid ${T.border}` };
const thStyle = {
  padding: "10px 12px",
  textAlign: "left",
  color: T.textDim,
  fontWeight: 500,
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 1,
};
const tdRowStyle = { borderBottom: `1px solid ${T.border}08` };
const rankCellBase = { padding: "10px 12px", fontWeight: 700, width: 36 };
const titleCellStyle = {
  padding: "10px 12px",
  color: T.text,
  maxWidth: 280,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const volCellStyle = { padding: "10px 12px", color: T.accent, fontWeight: 600 };
const badgeCellStyle = { padding: "10px 12px" };
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

const HEADERS = ["#", "市场", "交易量", "成交数"];

export default function VolumeRanking() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const data = await apiFetch("/v1/markets?first=100", {
          signal: ctrl.signal,
        });
        if (ctrl.signal.aborted) return;
        setMarkets(unwrapList(data));
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(e.message);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const sorted = useMemo(
    () => [...markets].sort((a, b) => (b.volume || 0) - (a.volume || 0)),
    [markets]
  );

  if (loading) return <Spinner />;

  return (
    <div>
      {error && <div style={errorStyle}>加载失败: {error}</div>}
      {sorted.length === 0 ? (
        <div style={emptyStyle}>{error ? "—" : "暂无数据"}</div>
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
              {sorted.map((m, i) => (
                <tr key={m.id || i} style={tdRowStyle}>
                  <td style={{ ...rankCellBase, color: i < 3 ? T.accent : T.textDim }}>
                    {i + 1}
                  </td>
                  <td style={titleCellStyle}>{m.title || m.question || m.id}</td>
                  <td style={volCellStyle}>${(m.volume || 0).toLocaleString()}</td>
                  <td style={badgeCellStyle}>
                    <Badge>{m.stats?.trades || "—"} trades</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
