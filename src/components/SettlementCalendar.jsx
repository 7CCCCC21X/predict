import { useState, useEffect, useMemo } from "react";
import { apiFetch, unwrapList } from "../api";
import { T, mono, sans } from "../theme";
import { Pill, StatBox, Spinner, Badge } from "./ui";

const filterRowStyle = { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" };
const statRowStyle = { display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" };
const listStyle = { display: "flex", flexDirection: "column", gap: 6 };
const rowBase = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 16px",
  borderRadius: 8,
  background: T.surfaceAlt,
  border: `1px solid ${T.border}`,
  gap: 12,
};
const titleStyle = {
  fontSize: 12,
  fontFamily: sans,
  color: T.text,
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const rightStyle = {
  display: "flex",
  gap: 6,
  flexShrink: 0,
  alignItems: "center",
  fontSize: 10,
  fontFamily: mono,
  color: T.textDim,
};
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
const noteStyle = {
  marginBottom: 12,
  padding: 10,
  background: `${T.blue}08`,
  border: `1px solid ${T.blue}20`,
  borderRadius: 6,
  fontSize: 10,
  fontFamily: mono,
  color: T.blue,
};

function timeSince(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "<1h";
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function SettlementCalendar() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("open");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const data = await apiFetch("/v1/markets?first=200", { signal: ctrl.signal });
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

  const { filtered, openN, closedN } = useMemo(() => {
    let openN = 0;
    let closedN = 0;
    for (const m of markets) {
      if (m.tradingStatus === "OPEN") openN++;
      else if (m.tradingStatus === "CLOSED") closedN++;
    }
    let l = markets;
    if (filter === "open") l = markets.filter((m) => m.tradingStatus === "OPEN");
    else if (filter === "resolved") l = markets.filter((m) => m.status === "RESOLVED");
    const copy = [...l];
    copy.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return { filtered: copy, openN, closedN };
  }, [markets, filter]);

  return (
    <div>
      <div style={noteStyle}>
        API 未返回结算截止时间字段。此视图按 tradingStatus/status 过滤并按创建时间倒序展示。
      </div>
      <div style={filterRowStyle}>
        <Pill active={filter === "open"} onClick={() => setFilter("open")}>
          活跃
        </Pill>
        <Pill active={filter === "resolved"} onClick={() => setFilter("resolved")}>
          已结算
        </Pill>
        <Pill active={filter === "all"} onClick={() => setFilter("all")}>
          全部
        </Pill>
      </div>
      <div style={statRowStyle}>
        <StatBox label="活跃" value={openN} color={T.accent} />
        <StatBox label="已关闭" value={closedN} color={T.textMuted} />
        <StatBox label="筛选" value={filtered.length} color={T.yellow} />
      </div>
      {error && <div style={errorStyle}>加载失败: {error}</div>}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div style={emptyStyle}>{error ? "—" : "没有符合条件的市场"}</div>
      ) : (
        <div style={listStyle}>
          {filtered.map((m) => (
            <div key={m.id} style={rowBase}>
              <span style={titleStyle}>{m.question || m.title || `#${m.id}`}</span>
              <div style={rightStyle}>
                <Badge color={m.tradingStatus === "OPEN" ? T.accent : T.textMuted}>
                  {m.tradingStatus || "—"}
                </Badge>
                <span>{timeSince(m.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
