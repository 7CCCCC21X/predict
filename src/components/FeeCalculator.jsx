import { useState, useMemo } from "react";
import { T, mono } from "../theme";
import { StatBox } from "./ui";

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
  marginBottom: 20,
};
const fieldLabelStyle = {
  fontSize: 10,
  color: T.textDim,
  fontFamily: mono,
  display: "block",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: 1,
};
const fieldInputStyle = {
  width: "100%",
  padding: "9px 12px",
  background: T.surfaceAlt,
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  color: T.text,
  fontFamily: mono,
  fontSize: 13,
  boxSizing: "border-box",
};
const statRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 10,
  marginBottom: 20,
};
const curveWrapStyle = {
  padding: 16,
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 10,
};
const curveTitleStyle = {
  fontSize: 10,
  color: T.textDim,
  fontFamily: mono,
  marginBottom: 10,
  textTransform: "uppercase",
  letterSpacing: 1,
};
const curveBarsWrap = { display: "flex", alignItems: "flex-end", gap: 1, height: 100 };
const barBase = { borderRadius: "2px 2px 0 0", minWidth: 1, flex: 1 };
const curveLabelRow = { display: "flex", justifyContent: "space-between", marginTop: 4 };
const curveLabelEdge = { fontSize: 9, color: T.textMuted, fontFamily: mono };
const curveLabelMid = { fontSize: 10, color: T.accent, fontFamily: mono };

const FIELDS = [
  { key: "price", l: "目标价格 (¢)", min: 1, max: 99 },
  { key: "amount", l: "交易金额 ($)", min: 1, max: 100000 },
  { key: "k", l: "费率系数 k", min: 0.01, max: 0.2, step: 0.01 },
  { key: "discount", l: "折扣率", min: 0.5, max: 1, step: 0.05 },
];

export default function FeeCalculator() {
  const [price, setPrice] = useState(50);
  const [amount, setAmount] = useState(100);
  const [k, setK] = useState(0.08);
  const [discount, setDiscount] = useState(0.9);

  const p = price / 100;
  const feeRate = k * p * (1 - p) * discount;
  const fee = amount * feeRate;
  const maxRate = k * 0.25 * discount;

  const rates = useMemo(
    () =>
      Array.from({ length: 99 }, (_, i) => {
        const cp = (i + 1) / 100;
        return k * cp * (1 - cp) * discount;
      }),
    [k, discount]
  );

  const setters = { price: setPrice, amount: setAmount, k: setK, discount: setDiscount };
  const values = { price, amount, k, discount };

  return (
    <div>
      <div style={gridStyle}>
        {FIELDS.map(({ key, l, ...rest }) => (
          <div key={key}>
            <label style={fieldLabelStyle}>{l}</label>
            <input
              type="number"
              value={values[key]}
              onChange={(e) => setters[key](Number(e.target.value))}
              {...rest}
              style={fieldInputStyle}
            />
          </div>
        ))}
      </div>
      <div style={statRowStyle}>
        <StatBox label="手续费" value={`$${fee.toFixed(4)}`} color={T.yellow} />
        <StatBox label="费率" value={`${(feeRate * 100).toFixed(4)}%`} color={T.accent} />
        <StatBox label="最大费率" value={`${(maxRate * 100).toFixed(2)}%`} />
      </div>
      <div style={curveWrapStyle}>
        <div style={curveTitleStyle}>费率曲线 · fee = k × p × (1-p) × discount</div>
        <div style={curveBarsWrap}>
          {rates.map((rate, i) => {
            const h = (rate / maxRate) * 100;
            const active = i + 1 === Math.round(price);
            return (
              <div
                key={i}
                style={{
                  ...barBase,
                  height: `${h}%`,
                  background: active ? T.accent : `${T.accent}30`,
                }}
              />
            );
          })}
        </div>
        <div style={curveLabelRow}>
          <span style={curveLabelEdge}>1¢</span>
          <span style={curveLabelMid}>
            {price}¢ → {(feeRate * 100).toFixed(3)}%
          </span>
          <span style={curveLabelEdge}>99¢</span>
        </div>
      </div>
    </div>
  );
}
