import { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { ConfigCtx } from "../config";
import { apiFetch } from "../api";
import { MOCK_MARKETS } from "../mocks";
import { T, mono, sans } from "../theme";
import { Pill, StatBox, Spinner, Hint } from "./ui";

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
const listStyle = { display: "flex", flexDirection: "column", gap: 6 };
const cardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 16px",
  background: T.surfaceAlt,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
};
const cardInner = { flex: 1, minWidth: 0 };
const titleStyle = {
  fontSize: 13,
  color: T.text,
  fontFamily: sans,
  fontWeight: 500,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const outcomesRowStyle = { display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" };
const outcomeChipBase = {
  fontSize: 10,
  fontFamily: mono,
  padding: "2px 7px",
  borderRadius: 4,
};
const volWrapStyle = { textAlign: "right", flexShrink: 0, marginLeft: 12 };
const volStyle = { fontSize: 14, fontFamily: mono, fontWeight: 700, color: T.accent };
const volLabelStyle = { fontSize: 9, color: T.textMuted, fontFamily: mono };

function outcomeColors(i) {
  if (i === 0) return { background: T.accentDim, color: T.accent };
  if (i === 1) return { background: T.redDim, color: T.red };
  return { background: `${T.blue}15`, color: T.blue };
}

export default function MarketMonitor() {
  const { live } = useContext(ConfigCtx);
  const [markets, setMarkets] = useState(MOCK_MARKETS);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("volume");
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);

  const fetchLive = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    const data = await apiFetch("/v1/markets?limit=50&status=active", { signal });
    if (signal?.aborted) return;
    if (data) {
      const list = data.data || (Array.isArray(data) ? data : []);
      if (list.length > 0) setMarkets(list);
      else setError("API returned empty");
    } else {
      setError("API request failed");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!live) {
      setMarkets(MOCK_MARKETS);
      return;
    }
    const ctrl = new AbortController();
    fetchLive(ctrl.signal);
    return () => ctrl.abort();
  }, [live, fetchLive]);

  useEffect(() => {
    if (!live || !autoRefresh) return;
    const ctrl = new AbortController();
    const id = setInterval(() => fetchLive(ctrl.signal), 30000);
    return () => {
      clearInterval(id);
      ctrl.abort();
    };
  }, [live, autoRefresh, fetchLive]);

  const sorted = useMemo(() => {
    let l = markets;
    if (search) {
      const q = search.toLowerCase();
      l = l.filter((m) => (m.title || m.question || "").toLowerCase().includes(q));
    }
    const copy = [...l];
    if (sortBy === "volume") copy.sort((a, b) => (b.volume || 0) - (a.volume || 0));
    else if (sortBy === "newest") copy.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return copy;
  }, [markets, sortBy, search]);

  return (
    <div>
      <div style={toolbarStyle}>
        <input
          placeholder="搜索市场..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />
        <Pill active={sortBy === "volume"} onClick={() => setSortBy("volume")}>
          交易量↓
        </Pill>
        <Pill active={sortBy === "newest"} onClick={() => setSortBy("newest")}>
          最新
        </Pill>
        <Pill active={autoRefresh} onClick={() => setAutoRefresh(!autoRefresh)}>
          自动刷新 {autoRefresh ? "ON" : "OFF"}
        </Pill>
        {live && (
          <button type="button" onClick={() => fetchLive()} style={refreshBtnStyle}>
            刷新
          </button>
        )}
      </div>

      <div style={statRowStyle}>
        <StatBox label="总市场" value={markets.length} color={T.accent} />
        <StatBox label="筛选" value={sorted.length} />
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {loading ? (
        <Spinner />
      ) : (
        <div style={listStyle}>
          {sorted.map((m) => {
            const outcomes = m.outcomes || m.options || [];
            return (
              <div key={m.id || m.marketId} style={cardStyle}>
                <div style={cardInner}>
                  <div style={titleStyle}>{m.title || m.question || m.id}</div>
                  <div style={outcomesRowStyle}>
                    {outcomes.slice(0, 4).map((o, i) => {
                      const lbl = typeof o === "string" ? o : o.name || o.title || `#${i + 1}`;
                      const pr = typeof o === "object" ? o.price : null;
                      return (
                        <span key={i} style={{ ...outcomeChipBase, ...outcomeColors(i) }}>
                          {lbl}
                          {pr != null ? ` ${(pr * 100).toFixed(1)}¢` : ""}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div style={volWrapStyle}>
                  <div style={volStyle}>${((m.volume || 0) / 1000).toFixed(0)}K</div>
                  <div style={volLabelStyle}>VOL</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!live && <Hint>MOCK 模式 — 部署后切 LIVE 调用 GET /v1/markets</Hint>}
    </div>
  );
}
