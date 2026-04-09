import { useState, useEffect, useRef, useContext } from "react";
import { ConfigCtx } from "../config";
import { apiFetch } from "../api";
import { MOCK_POSITIONS } from "../mocks";
import { T, mono, sans } from "../theme";
import { StatBox, Spinner } from "./ui";

const toolbarStyle = { display: "flex", gap: 10, marginBottom: 20 };
const inputStyle = {
  flex: 1,
  padding: "10px 14px",
  background: T.surfaceAlt,
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  color: T.text,
  fontFamily: mono,
  fontSize: 12,
  outline: "none",
};
const btnStyle = {
  padding: "10px 22px",
  background: T.accent,
  border: "none",
  borderRadius: 6,
  color: T.bg,
  fontFamily: mono,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
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
const statRowStyle = { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" };
const emptyStyle = { textAlign: "center", padding: 30, color: T.textDim, fontFamily: mono };
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
const titleStyle = { fontSize: 13, fontFamily: sans, color: T.text, fontWeight: 500 };
const subTitleStyle = { fontSize: 10, color: T.textDim, fontFamily: mono, marginTop: 3 };
const pnlBase = { fontSize: 15, fontFamily: mono, fontWeight: 700 };

export default function WalletLookup() {
  const { live } = useContext(ConfigCtx);
  const [addr, setAddr] = useState("");
  const [pos, setPos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const lookup = async () => {
    if (!addr) return;
    setLoading(true);
    setError(null);
    if (!live) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setPos(MOCK_POSITIONS);
        setLoading(false);
      }, 400);
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const data = await apiFetch(`/positions/${addr}`, { signal: ctrl.signal });
    if (ctrl.signal.aborted) return;
    if (data) {
      setPos(data.data || (Array.isArray(data) ? data : []));
    } else {
      setError("查询失败");
      setPos([]);
    }
    setLoading(false);
  };

  const totalPnl = pos ? pos.reduce((s, p) => s + (p.pnl || 0), 0) : 0;

  return (
    <div>
      <div style={toolbarStyle}>
        <input
          placeholder="输入钱包地址 0x…"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup()}
          style={inputStyle}
        />
        <button type="button" onClick={lookup} style={btnStyle}>
          查询
        </button>
      </div>
      {error && <div style={errorStyle}>{error}</div>}
      {loading && <Spinner />}
      {pos && !loading && (
        <>
          <div style={statRowStyle}>
            <StatBox label="持仓数" value={pos.length} color={T.accent} />
            <StatBox
              label="总 PnL"
              value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`}
              color={totalPnl >= 0 ? T.accent : T.red}
            />
          </div>
          {pos.length === 0 ? (
            <div style={emptyStyle}>该地址暂无持仓</div>
          ) : (
            <div style={listStyle}>
              {pos.map((p, i) => (
                <div key={i} style={cardStyle}>
                  <div>
                    <div style={titleStyle}>{p.marketTitle || `#${i + 1}`}</div>
                    <div style={subTitleStyle}>
                      {p.outcome || "—"} · {p.shares || "—"} shares
                    </div>
                  </div>
                  <div style={{ ...pnlBase, color: (p.pnl || 0) >= 0 ? T.accent : T.red }}>
                    {(p.pnl || 0) >= 0 ? "+" : ""}${(p.pnl || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
