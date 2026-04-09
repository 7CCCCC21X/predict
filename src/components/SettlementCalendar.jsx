import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../api";
import { T, mono, sans } from "../theme";
import { Pill, StatBox, Spinner } from "./ui";

const filterRowStyle = { display: "flex", gap: 8, marginBottom: 16 };
const statRowStyle = { display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" };
const listStyle = { display: "flex", flexDirection: "column", gap: 6 };
const rowBase = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 16px",
  borderRadius: 8,
};
const titleStyle = {
  fontSize: 12,
  fontFamily: sans,
  color: T.text,
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
const dateBase = {
  fontSize: 11,
  fontFamily: mono,
  fontWeight: 600,
  flexShrink: 0,
  marginLeft: 12,
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

export default function SettlementCalendar() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const data = await apiFetch("/v1/markets?limit=200", { signal: ctrl.signal });
        if (ctrl.signal.aborted) return;
        setMarkets(data.data || (Array.isArray(data) ? data : []));
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(e.message);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const { filtered, todayN, todayStr } = useMemo(() => {
    const now = new Date();
    const eow = new Date(now);
    eow.setDate(now.getDate() + (7 - now.getDay()));
    eow.setHours(23, 59, 59, 999);
    const eom = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const todayStr = now.toDateString();

    const items = [];
    let todayN = 0;
    for (const m of markets) {
      const raw = m.cutoffAt || m.endDate;
      if (!raw) continue;
      const d = new Date(raw);
      if (d.toDateString() === todayStr) todayN++;
      if (d < now) continue;
      if (filter === "week" && d > eow) continue;
      if (filter === "month" && d > eom) continue;
      items.push({ m, d });
    }
    items.sort((a, b) => a.d - b.d);
    return { filtered: items, todayN, todayStr };
  }, [markets, filter]);

  return (
    <div>
      <div style={filterRowStyle}>
        <Pill active={filter === "all"} onClick={() => setFilter("all")}>
          全部
        </Pill>
        <Pill active={filter === "week"} onClick={() => setFilter("week")}>
          本周
        </Pill>
        <Pill active={filter === "month"} onClick={() => setFilter("month")}>
          本月
        </Pill>
      </div>
      <div style={statRowStyle}>
        <StatBox label="即将结算" value={filtered.length} color={T.yellow} />
        <StatBox
          label="今日结算"
          value={todayN}
          color={todayN > 0 ? T.red : T.textDim}
        />
      </div>
      {error && <div style={errorStyle}>加载失败: {error}</div>}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div style={emptyStyle}>{error ? "—" : "暂无即将结算的市场"}</div>
      ) : (
        <div style={listStyle}>
          {filtered.map(({ m, d }, i) => {
            const isToday = d.toDateString() === todayStr;
            const isSoon = d - new Date() < 7 * 864e5;
            return (
              <div
                key={m.id || i}
                style={{
                  ...rowBase,
                  background: isToday ? T.redDim : T.surfaceAlt,
                  border: `1px solid ${isToday ? `${T.red}33` : T.border}`,
                }}
              >
                <span style={titleStyle}>{m.title || m.question || m.id}</span>
                <span
                  style={{
                    ...dateBase,
                    color: isToday ? T.red : isSoon ? T.yellow : T.textDim,
                  }}
                >
                  {d.toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
