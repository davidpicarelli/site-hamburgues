// Brazilian Portuguese formatters

export function formatBRL(value) {
  if (value === null || value === undefined || isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value, decimals = 4) {
  if (value === null || value === undefined || isNaN(value)) return "0,00%";
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDate(isoString) {
  if (!isoString) return "";
  try {
    const [y, m, d] = isoString.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return isoString;
  }
}

export function todayISO() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

export function dateInputToISO(dateStr) {
  // Already YYYY-MM-DD
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // DD/MM/YYYY -> YYYY-MM-DD
  const m = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return dateStr;
}

// Parse a Brazilian-style number string like "1.234,56" or "1234.56" or "2,5" into a Number
export function parseNumberBR(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const s = String(value).trim();
  // If contains both . and , -> use BR convention (comma decimal)
  if (s.includes(",") && s.includes(".")) {
    return Number(s.replace(/\./g, "").replace(",", "."));
  }
  if (s.includes(",")) {
    return Number(s.replace(/\./g, "").replace(",", "."));
  }
  return Number(s);
}

export function addMonthsISO(isoDate, months) {
  const [y, m, d] = isoDate.split("-").map((n) => parseInt(n, 10));
  const date = new Date(y, m - 1 + months, d);
  // clamp day-of-month
  if (date.getDate() !== d) {
    date.setDate(0); // last day of previous month
  }
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
