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
  maxWidth: 260,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const volCellStyle = { padding: "10px 12px", color: T.accent, fontWeight: 600 };
const subCellStyle = { padding: "10px 12px", color: T.textDim, fontSize: 11 };
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
const hintStyle = {
  marginBottom: 12,
  padding: 10,
  background: `${T.blue}08`,
  border: `1px solid ${T.blue}20`,
  borderRadius: 6,
  fontSize: 10,
  fontFamily: mono,
  color: T.blue,
};

const HEADERS = ["#", "市场", "总成交 $", "24h $", "流动性 $"];
const STATS_FETCH_LIMIT = 30;

function fmt(n) {
  if (n == null || !isFinite(n)) return "—";
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${Math.round(n)}`;
}

export default function VolumeRanking() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const listData = await apiFetch("/v1/markets?first=100", { signal: ctrl.signal });
        if (ctrl.signal.aborted) return;
        const markets = unwrapList(listData);
        const openMarkets = markets
          .filter((m) => m.tradingStatus === "OPEN")
          .slice(0, STATS_FETCH_LIMIT);
        const source = openMarkets.length > 0 ? openMarkets : markets.slice(0, STATS_FETCH_LIMIT);

        const withStats = await Promise.all(
          source.map(async (m) => {
            try {
              const s = await apiFetch(`/v1/markets/${m.id}/stats`, { signal: ctrl.signal });
              const stats = s?.data || {};
              return {
                id: m.id,
                title: m.question || m.title || `#${m.id}`,
                tradingStatus: m.tradingStatus,
                volumeTotalUsd: Number(stats.volumeTotalUsd) || 0,
                volume24hUsd: Number(stats.volume24hUsd) || 0,
                totalLiquidityUsd: Number(stats.totalLiquidityUsd) || 0,
              };
            } catch {
              return {
                id: m.id,
                title: m.question || m.title || `#${m.id}`,
                tradingStatus: m.tradingStatus,
                volumeTotalUsd: 0,
                volume24hUsd: 0,
                totalLiquidityUsd: 0,
              };
            }
          })
        );
        if (ctrl.signal.aborted) return;
        setRows(withStats);
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
    () => [...rows].sort((a, b) => b.volumeTotalUsd - a.volumeTotalUsd),
    [rows]
  );

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={hintStyle}>
        取前 {STATS_FETCH_LIMIT} 个活跃市场,并行调用 /v1/markets/:id/stats 获取成交量,按 volumeTotalUsd 排序
      </div>
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
              {sorted.map((r, i) => (
                <tr key={r.id} style={tdRowStyle}>
                  <td style={{ ...rankCellBase, color: i < 3 ? T.accent : T.textDim }}>
                    {i + 1}
                  </td>
                  <td style={titleCellStyle}>
                    {r.title}{" "}
                    <Badge color={r.tradingStatus === "OPEN" ? T.accent : T.textMuted}>
                      {r.tradingStatus || "—"}
                    </Badge>
                  </td>
                  <td style={volCellStyle}>{fmt(r.volumeTotalUsd)}</td>
                  <td style={subCellStyle}>{fmt(r.volume24hUsd)}</td>
                  <td style={subCellStyle}>{fmt(r.totalLiquidityUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
