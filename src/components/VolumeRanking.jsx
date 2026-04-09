import { useState, useEffect, useMemo, useContext } from "react";
import { ConfigCtx } from "../config";
import { apiFetch } from "../api";
import { MOCK_MARKETS } from "../mocks";
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

const HEADERS = ["#", "市场", "交易量", "成交数"];

export default function VolumeRanking() {
  const { live } = useContext(ConfigCtx);
  const [markets, setMarkets] = useState(MOCK_MARKETS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!live) {
      setMarkets(MOCK_MARKETS);
      return;
    }
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      const data = await apiFetch("/v1/markets?limit=100&status=active", {
        signal: ctrl.signal,
      });
      if (ctrl.signal.aborted) return;
      const list = data?.data || (Array.isArray(data) ? data : []);
      if (list.length > 0) setMarkets(list);
      setLoading(false);
    })();
    return () => ctrl.abort();
  }, [live]);

  const sorted = useMemo(
    () => [...markets].sort((a, b) => (b.volume || 0) - (a.volume || 0)),
    [markets]
  );

  if (loading) return <Spinner />;

  return (
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
  );
}
