import { useState, useEffect, useMemo } from "react";
import { apiFetch, unwrapList } from "../api";
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
  width: 90,
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

const HEADERS = ["时间", "市场", "角色", "金额", "价格", "签名地址"];

// valueUsdtWei is a 6-decimal USDT wei value per predict.fun docs.
function weiToUsd(wei) {
  if (wei == null) return 0;
  const n = typeof wei === "string" ? Number(wei) : wei;
  if (!isFinite(n)) return 0;
  return n / 1e6;
}

export default function OrderFlow() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [min, setMin] = useState(100);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const data = await apiFetch("/v1/orders/matches?first=100", {
          signal: ctrl.signal,
        });
        if (ctrl.signal.aborted) return;
        setMatches(unwrapList(data));
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(e.message);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const rows = useMemo(
    () =>
      matches.map((m) => ({
        id: m.id || m.conditionId || `${m.marketId}-${m.executedAt}`,
        ts: m.executedAt || m.timestamp || m.createdAt,
        marketLabel: m.marketTitle || m.marketQuestion || `#${m.marketId || "—"}`,
        isMaker: !!m.isSignerMaker,
        usd: weiToUsd(m.valueUsdtWei || m.amount || m.filledAmount),
        price: m.price != null ? Number(m.price) : null,
        addr: m.signerAddress || m.taker || m.maker || "",
      })),
    [matches]
  );

  const filtered = useMemo(() => rows.filter((r) => r.usd >= min), [rows, min]);
  const bigCount = useMemo(() => rows.filter((r) => r.usd >= 5000).length, [rows]);

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
        <div style={emptyStyle}>{error ? "—" : "暂无符合条件的成交"}</div>
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
              {filtered.map((r) => (
                <tr key={r.id} style={tdRowStyle}>
                  <td style={timeCellStyle}>
                    {r.ts ? new Date(r.ts).toLocaleTimeString() : "—"}
                  </td>
                  <td style={mktCellStyle}>{r.marketLabel}</td>
                  <td style={sideCellStyle}>
                    <span style={{ color: r.isMaker ? T.blue : T.accent, fontWeight: 600 }}>
                      {r.isMaker ? "MAKER" : "TAKER"}
                    </span>
                  </td>
                  <td style={{ ...amtCellBase, color: r.usd >= 5000 ? T.yellow : T.text }}>
                    ${r.usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td style={priceCellStyle}>
                    {r.price != null ? `${(r.price * 100).toFixed(1)}¢` : "—"}
                  </td>
                  <td style={addrCellStyle}>
                    {r.addr ? `${r.addr.slice(0, 6)}…${r.addr.slice(-4)}` : "—"}
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
