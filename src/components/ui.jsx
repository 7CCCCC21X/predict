import { T, mono } from "../theme";

const pillBase = {
  padding: "5px 13px",
  borderRadius: 6,
  fontSize: 11,
  fontFamily: mono,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export const Pill = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      ...pillBase,
      border: `1px solid ${active ? T.accent : T.border}`,
      background: active ? T.accentDim : "transparent",
      color: active ? T.accent : T.textDim,
    }}
  >
    {children}
  </button>
);

const statBoxWrap = {
  padding: "12px 16px",
  background: T.surfaceAlt,
  borderRadius: 8,
  border: `1px solid ${T.border}`,
  minWidth: 100,
};
const statBoxLabel = {
  fontSize: 10,
  color: T.textDim,
  fontFamily: mono,
  marginBottom: 3,
  textTransform: "uppercase",
  letterSpacing: 1,
};
const statBoxValueBase = {
  fontSize: 18,
  fontFamily: mono,
  fontWeight: 700,
};

export const StatBox = ({ label, value, color }) => (
  <div style={statBoxWrap}>
    <div style={statBoxLabel}>{label}</div>
    <div style={{ ...statBoxValueBase, color: color || T.text }}>{value ?? "—"}</div>
  </div>
);

const badgeBase = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 4,
  fontSize: 10,
  fontFamily: mono,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

export const Badge = ({ children, color }) => (
  <span
    style={{
      ...badgeBase,
      color: color || T.accent,
      background: color ? `${color}18` : T.accentDim,
    }}
  >
    {children}
  </span>
);

const spinnerWrap = { display: "flex", justifyContent: "center", padding: 40 };
const spinnerInner = {
  width: 24,
  height: 24,
  border: `2px solid ${T.border}`,
  borderTopColor: T.accent,
  borderRadius: "50%",
  animation: "spin .8s linear infinite",
};

export const Spinner = () => (
  <div style={spinnerWrap}>
    <div style={spinnerInner} />
  </div>
);

const hintStyle = {
  marginTop: 16,
  padding: 12,
  background: `${T.blue}08`,
  border: `1px solid ${T.blue}20`,
  borderRadius: 8,
  fontSize: 10,
  fontFamily: mono,
  color: T.blue,
};

export const Hint = ({ children }) => <div style={hintStyle}>{children}</div>;
