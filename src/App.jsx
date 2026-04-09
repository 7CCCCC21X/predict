import { useState, lazy, Suspense } from "react";
import { ConfigCtx } from "./config";
import { T, mono, sans } from "./theme";
import { Spinner } from "./components/ui";

const MarketMonitor = lazy(() => import("./components/MarketMonitor"));
const VolumeRanking = lazy(() => import("./components/VolumeRanking"));
const OrderFlow = lazy(() => import("./components/OrderFlow"));
const WalletLookup = lazy(() => import("./components/WalletLookup"));
const FeeCalculator = lazy(() => import("./components/FeeCalculator"));
const WSMonitor = lazy(() => import("./components/WSMonitor"));
const SettlementCalendar = lazy(() => import("./components/SettlementCalendar"));

const TABS = [
  { id: "monitor", label: "市场监控", icon: "◉", Comp: MarketMonitor },
  { id: "volume", label: "交易量排名", icon: "▲", Comp: VolumeRanking },
  { id: "flow", label: "订单流", icon: "⇄", Comp: OrderFlow },
  { id: "wallet", label: "钱包查询", icon: "◎", Comp: WalletLookup },
  { id: "fee", label: "手续费", icon: "✦", Comp: FeeCalculator },
  { id: "ws", label: "WebSocket", icon: "⚡", Comp: WSMonitor },
  { id: "calendar", label: "结算日历", icon: "▦", Comp: SettlementCalendar },
];

const shellStyle = {
  minHeight: "100vh",
  background: T.bg,
  color: T.text,
  fontFamily: sans,
};
const headerStyle = {
  padding: "12px 20px",
  borderBottom: `1px solid ${T.border}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: `${T.surface}ee`,
  backdropFilter: "blur(12px)",
  position: "sticky",
  top: 0,
  zIndex: 100,
};
const brandRow = { display: "flex", alignItems: "center", gap: 10 };
const brandLogo = {
  width: 28,
  height: 28,
  borderRadius: 7,
  background: `linear-gradient(135deg,${T.accent},${T.blue})`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  fontWeight: 900,
  color: T.bg,
};
const brandName = {
  fontFamily: mono,
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: -0.5,
};
const liveBtnBase = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "5px 14px",
  borderRadius: 6,
  fontFamily: mono,
  fontSize: 11,
  cursor: "pointer",
};
const liveDotBase = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  display: "inline-block",
};
const bodyStyle = { display: "flex", minHeight: "calc(100vh - 53px)" };
const navStyle = {
  width: 190,
  padding: "14px 8px",
  borderRight: `1px solid ${T.border}`,
  background: T.surface,
  flexShrink: 0,
};
const navBtnBase = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  width: "100%",
  padding: "9px 12px",
  border: "none",
  borderRadius: 7,
  fontFamily: sans,
  fontSize: 12,
  cursor: "pointer",
  marginBottom: 2,
  textAlign: "left",
};
const navIconStyle = { fontSize: 13, width: 18, textAlign: "center" };
const apiInfoStyle = {
  marginTop: 20,
  padding: 12,
  background: T.surfaceAlt,
  borderRadius: 8,
  border: `1px solid ${T.border}`,
};
const apiInfoLabel = {
  fontSize: 9,
  color: T.textDim,
  fontFamily: mono,
  textTransform: "uppercase",
  letterSpacing: 1,
  marginBottom: 5,
};
const apiInfoList = {
  fontSize: 10,
  color: T.textMuted,
  fontFamily: mono,
  lineHeight: 1.8,
};
const mainStyle = { flex: 1, padding: 22, overflowY: "auto", maxWidth: 900 };
const mainTitleStyle = {
  fontFamily: mono,
  fontSize: 16,
  fontWeight: 700,
  marginBottom: 18,
  display: "flex",
  alignItems: "center",
  gap: 8,
};
const mainTitleIcon = { color: T.accent };

export default function App() {
  const [tab, setTab] = useState("monitor");
  const [live, setLive] = useState(false);

  const active = TABS.find((t) => t.id === tab);
  const ActiveComp = active?.Comp;

  return (
    <ConfigCtx.Provider value={{ live }}>
      <div style={shellStyle}>
        <header style={headerStyle}>
          <div style={brandRow}>
            <div style={brandLogo}>P</div>
            <span style={brandName}>
              Predict<span style={{ color: T.accent }}>.dash</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLive(!live)}
            style={{
              ...liveBtnBase,
              border: `1px solid ${live ? T.accent : T.yellow}44`,
              background: live ? T.accentDim : `${T.yellow}12`,
              color: live ? T.accent : T.yellow,
            }}
          >
            <span style={{ ...liveDotBase, background: live ? T.accent : T.yellow }} />
            {live ? "LIVE" : "MOCK"}
          </button>
        </header>

        <div style={bodyStyle}>
          <nav style={navStyle}>
            {TABS.map((t) => {
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  style={{
                    ...navBtnBase,
                    background: isActive ? T.accentDim : "transparent",
                    color: isActive ? T.accent : T.textDim,
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <span style={navIconStyle}>{t.icon}</span>
                  {t.label}
                </button>
              );
            })}
            <div style={apiInfoStyle}>
              <div style={apiInfoLabel}>API</div>
              <div style={apiInfoList}>
                监控→/v1/markets
                <br />
                排名→/markets/stats
                <br />
                订单→/orders/matches
                <br />
                钱包→/positions/addr
                <br />
                WS→wss://ws…/ws
              </div>
            </div>
          </nav>

          <main style={mainStyle}>
            <h2 style={mainTitleStyle}>
              <span style={mainTitleIcon}>{active?.icon}</span>
              {active?.label}
            </h2>
            <Suspense fallback={<Spinner />}>{ActiveComp && <ActiveComp />}</Suspense>
          </main>
        </div>
      </div>
    </ConfigCtx.Provider>
  );
}
