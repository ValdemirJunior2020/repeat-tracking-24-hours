// src/utils/transform.js
// We still parse column C to SHOW it in the table, but we DO NOT use it
// for totals/charts anymore. Totals/charts are counts of rows.

const NUM_KEYS = [
  "phone", "number-called", "number called", "number_called",
  "number", "phone-number-called-from", "phone number called from", "list"
];
const QTY_KEYS = ["calls#", "calls", "quantity", "qty"];
const WHO_KEYS = ["who called", "who_called", "who"];
const REASON_KEYS = ["reason", "reasons"];

function pick(obj, keys) {
  for (const [k, v] of Object.entries(obj)) {
    const norm = String(k).trim().toLowerCase();
    if (keys.some((needle) => norm === needle || norm.includes(needle))) return v;
  }
  return undefined;
}

function toNumberOrNull(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (!s || s === "#N/A") return null;
  const n = Number(s.replace(/[^\d.\-]+/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function normalizeRow(raw) {
  const numberRaw = pick(raw, NUM_KEYS);
  const qtyRaw = pick(raw, QTY_KEYS);
  const whoRaw = pick(raw, WHO_KEYS);
  const reasonRaw = pick(raw, REASON_KEYS);

  // A) phone number (fix scientific notation like 5.27E+11)
  let numberCalled = numberRaw ? String(numberRaw).trim() : "";
  if (/e\+?/i.test(numberCalled)) {
    const asNum = Number(numberCalled);
    if (Number.isFinite(asNum)) numberCalled = String(Math.trunc(asNum));
  }

  // B) quantity from column C — for DISPLAY ONLY
  // If it looks insane (e.g., a 10–15 digit phone number), show "—"
  let quantity = toNumberOrNull(qtyRaw);
  if (quantity !== null && quantity > 100) quantity = null;

  const whoCalled = (whoRaw && String(whoRaw).trim()) || "";
  const reason = (reasonRaw && String(reasonRaw).trim()) || "(No Reason)";

  return { numberCalled, quantity, whoCalled, reason };
}

// === COUNT-BASED AGGREGATIONS (ignore column C) ===
export function aggregateByReason(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = r.reason || "(No Reason)";
    map.set(key, (map.get(key) || 0) + 1);
  }
  const arr = Array.from(map.entries())
    .map(([reason, quantity]) => ({ reason, quantity })) // "quantity" = count for chart compatibility
    .sort((a, b) => b.quantity - a.quantity);
  const total = rows.length; // total rows = total calls
  return { total, arr };
}

export function aggregateByNumber(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = r.numberCalled || "—";
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries()).map(([number, total]) => ({ number, total }));
}
