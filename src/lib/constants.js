export const T = {
  navy:   "#0B1F3A",
  dark:   "#0d1821",
  card:   "#111d28",
  border: "rgba(201,168,76,0.13)",
  gold:   "#C9A84C",
  goldL:  "#E2C46E",
  dim:    "rgba(255,255,255,0.38)",
  mid:    "rgba(255,255,255,0.65)",
  green:  "#5DBB7A",
  amber:  "#F0A500",
  red:    "#E05555",
};

export const VARIANTS = [
  { key:"yellow", label:"Yellow Garri", emoji:"🟡", color:"#FFB347", bg:"rgba(196,98,26,0.18)", border:"rgba(196,98,26,0.35)" },
  { key:"white",  label:"White Garri",  emoji:"⬜", color:"#E2C46E", bg:"rgba(201,168,76,0.15)", border:"rgba(201,168,76,0.3)"  },
  { key:"ijebu",  label:"Ijebu Garri",  emoji:"🟢", color:"#6BCB77", bg:"rgba(26,107,53,0.2)",   border:"rgba(26,107,53,0.4)"  },
];

export const PAY_MODES = ["Cash", "Transfer", "POS"];

export const n   = v => Number(v) || 0;
export const fc  = v => v !== "" && !isNaN(Number(v)) ? "₦" + Number(v).toLocaleString() : "—";
export const uid = () => Date.now() + Math.random();
export const tod = () => new Date().toISOString().slice(0, 10);
