import { T } from '../lib/constants';

export function Btn({ children, onClick, variant = "gold", size = "md", full, disabled }) {
  const vs = {
    gold:    { background: T.gold,   color: T.navy },
    ghost:   { background: "rgba(255,255,255,0.06)", color: "#fff" },
    danger:  { background: "rgba(224,85,85,0.18)",  color: T.red,   border: "1px solid rgba(224,85,85,0.3)" },
    green:   { background: "rgba(93,187,122,0.18)", color: T.green, border: "1px solid rgba(93,187,122,0.3)" },
    outline: { background: "transparent", color: T.gold, border: `1px solid ${T.border}` },
  };
  const ps = { sm: "8px 14px", md: "11px 20px", lg: "14px 0" };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...vs[variant], padding: ps[size], width: full ? "100%" : undefined,
      borderRadius: 8, border: vs[variant].border || "none",
      fontSize: size === "sm" ? 10 : size === "lg" ? 14 : 12,
      fontWeight: 900, letterSpacing: 1.5, textTransform: "uppercase",
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
      fontFamily: "inherit", transition: "opacity .15s",
    }}>{children}</button>
  );
}

export function Card({ title, icon, subtitle, children, noPad }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
      {title && (
        <div style={{ background: "rgba(201,168,76,0.06)", borderBottom: `1px solid ${T.border}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: 3, color: T.gold }}>{title}</span>
          {subtitle && <span style={{ marginLeft: "auto", fontSize: 9, color: T.dim, letterSpacing: 1.5 }}>{subtitle}</span>}
        </div>
      )}
      <div style={noPad ? {} : { padding: 16 }}>{children}</div>
    </div>
  );
}

export function Field({ label, value, onChange, type = "text", prefix, suffix, placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: "block", fontSize: 9, letterSpacing: 1.5, color: T.dim, textTransform: "uppercase", marginBottom: 5 }}>{label}</label>}
      <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", border: `1px solid rgba(201,168,76,0.2)`, borderRadius: 7, overflow: "hidden" }}>
        {prefix && <span style={{ padding: "0 10px", color: T.gold, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{prefix}</span>}
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || "—"}
          style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", padding: "11px 12px", fontSize: 14, fontFamily: "inherit" }} />
        {suffix && <span style={{ padding: "0 12px", color: T.dim, fontSize: 12 }}>{suffix}</span>}
      </div>
    </div>
  );
}

export function Chip({ label, color, bg, border }) {
  return <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 4, fontSize: 9, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color, background: bg, border: `1px solid ${border}` }}>{label}</span>;
}

export function StatBox({ label, value, color }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 6px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, color: color || "#fff", letterSpacing: 0.5, lineHeight: 1, wordBreak: "break-all" }}>{value}</div>
      <div style={{ fontSize: 7, letterSpacing: 1, color: T.dim, textTransform: "uppercase", marginTop: 4 }}>{label}</div>
    </div>
  );
}

export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: T.dark, overflowX: "auto" }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          flex: 1, minWidth: 60, padding: "13px 4px 11px", background: "none", border: "none",
          borderBottom: active === t.key ? `2px solid ${T.gold}` : "2px solid transparent",
          color: active === t.key ? T.gold : T.dim,
          fontSize: 9, fontWeight: 900, letterSpacing: 1.5, textTransform: "uppercase",
          cursor: "pointer", transition: "all .15s", fontFamily: "inherit", whiteSpace: "nowrap",
        }}>{t.label}</button>
      ))}
    </div>
  );
}

export function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: 60, color: T.dim, fontSize: 13 }}>Loading...</div>
  );
}

export function Alert({ msg, type = "error" }) {
  if (!msg) return null;
  const colors = { error: T.red, success: T.green, warn: T.amber };
  return (
    <div style={{ padding: "10px 14px", background: `${colors[type]}18`, border: `1px solid ${colors[type]}44`, borderRadius: 7, fontSize: 12, color: colors[type], marginBottom: 12 }}>
      {msg}
    </div>
  );
}
