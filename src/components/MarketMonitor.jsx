import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { apiFetch, unwrapList } from "../api";
import { T, mono, sans } from "../theme";
import { Pill, StatBox, Spinner, Badge } from "./ui";

const toolbarStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
  marginBottom: 16,
};
const searchInputStyle = {
  padding: "8px 14px",
  background: T.surfaceAlt,
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  color: T.text,
  fontFamily: mono,
  fontSize: 12,
  outline: "none",
  flex: 1,
  minWidth: 160,
};
const refreshBtnStyle = {
  padding: "6px 14px",
  background: T.accentDim,
  border: `1px solid ${T.accent}33`,
  borderRadius: 6,
  color: T.accent,
  fontFamily: mono,
  fontSize: 11,
  cursor: "pointer",
};
const statRowStyle = { display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" };
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
const listStyle = { display: "flex", flexDirection: "column", gap: 6 };
const cardStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  padding: "12px 16px",
  background: T.surfaceAlt,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
};
const cardHeaderRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
};
const titleStyle = {
  fontSize: 13,
  color: T.text,
  fontFamily: sans,
  fontWeight: 500,
  flex: 1,
  minWidth: 0,
};
const metaRow = {
  display: "flex",
  gap: 6,
  alignItems: "center",
  flexWrap: "wrap",
  flexShrink: 0,
};
const subMetaRow = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  fontSize: 10,
  color: T.textMuted,
  fontFamily: mono,
};
const outcomesRowStyle = { display: "flex", gap: 5, flexWrap: "wrap" };
const outcomeChipBase = {
  fontSize: 10,
  fontFamily: mono,
  padding: "2px 8px",
  borderRadius: 4,
  fontWeight: 600,
};

function outcomeStyle(status) {
  if (status === "WON") return { background: T.accentDim, color: T.accent };
  if (status === "LOST") return { background: T.redDim, color: T.red };
  return { background: `${T.blue}15`, color: T.blue };
}

function statusColor(tradingStatus) {
  if (tradingStatus === "OPEN") return T.accent;
  if (tradingStatus === "CLOSED") return T.textMuted;
  return T.yellow;
}

function timeAgo(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const s = Math.floor(diffMs / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString();
}

export default function MarketMonitor() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchMarkets = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/v1/markets?first=100", { signal: ctrl.signal });
      if (ctrl.signal.aborted) return;
      setMarkets(unwrapList(data));
    } catch (e) {
      if (e.name === "AbortError") return;
      setError(e.message);
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
    return () => abortRef.current?.abort();
  }, [fetchMarkets]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchMarkets, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchMarkets]);

  const filtered = useMemo(() => {
    let l = markets;
    if (statusFilter !== "ALL") {
      l = l.filter((m) => m.tradingStatus === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      l = l.filter(
        (m) =>
          (m.title || "").toLowerCase().includes(q) ||
          (m.question || "").toLowerCase().includes(q) ||
          (m.categorySlug || "").toLowerCase().includes(q)
      );
    }
    const copy = [...l];
    if (sortBy === "newest") {
      copy.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === "oldest") {
      copy.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }
    return copy;
  }, [markets, sortBy, search, statusFilter]);

  const openCount = useMemo(
    () => markets.filter((m) => m.tradingStatus === "OPEN").length,
    [markets]
  );

  return (
    <div>
      <div style={toolbarStyle}>
        <input
          placeholder="搜索市场 / question / category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />
        <Pill active={statusFilter === "OPEN"} onClick={() => setStatusFilter("OPEN")}>
          活跃
        </Pill>
        <Pill active={statusFilter === "CLOSED"} onClick={() => setStatusFilter("CLOSED")}>
          已结算
        </Pill>
        <Pill active={statusFilter === "ALL"} onClick={() => setStatusFilter("ALL")}>
          全部
        </Pill>
        <Pill active={sortBy === "newest"} onClick={() => setSortBy("newest")}>
          最新↓
        </Pill>
        <Pill active={autoRefresh} onClick={() => setAutoRefresh(!autoRefresh)}>
          自动刷新 {autoRefresh ? "ON" : "OFF"}
        </Pill>
        <button type="button" onClick={fetchMarkets} style={refreshBtnStyle}>
          刷新
        </button>
      </div>

      <div style={statRowStyle}>
        <StatBox label="总市场" value={markets.length} />
        <StatBox label="活跃" value={openCount} color={T.accent} />
        <StatBox label="筛选" value={filtered.length} color={T.yellow} />
      </div>

      {error && <div style={errorStyle}>加载失败: {error}</div>}

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div style={emptyStyle}>{error ? "—" : "没有符合条件的市场"}</div>
      ) : (
        <div style={listStyle}>
          {filtered.map((m) => {
            const outcomes = m.outcomes || [];
            const label = m.question || m.title || `#${m.id}`;
            return (
              <div key={m.id || m.conditionId} style={cardStyle}>
                <div style={cardHeaderRow}>
                  <div style={titleStyle}>{label}</div>
                  <div style={metaRow}>
                    <Badge color={statusColor(m.tradingStatus)}>
                      {m.tradingStatus || "—"}
                    </Badge>
                    {m.marketVariant && m.marketVariant !== "DEFAULT" && (
                      <Badge color={T.blue}>{m.marketVariant}</Badge>
                    )}
                  </div>
                </div>
                <div style={outcomesRowStyle}>
                  {outcomes.slice(0, 6).map((o, i) => (
                    <span key={i} style={{ ...outcomeChipBase, ...outcomeStyle(o.status) }}>
                      {o.name}
                      {o.status && o.status !== "UNRESOLVED" ? ` · ${o.status}` : ""}
                    </span>
                  ))}
                </div>
                <div style={subMetaRow}>
                  <span>#{m.id}</span>
                  <span>·</span>
                  <span>{timeAgo(m.createdAt)}</span>
                  {m.categorySlug && (
                    <>
                      <span>·</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {m.categorySlug}
                      </span>
                    </>
                  )}
                  {m.feeRateBps != null && (
                    <>
                      <span>·</span>
                      <span>fee {(m.feeRateBps / 100).toFixed(2)}%</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
