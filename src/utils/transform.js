// src/utils/transform.js
const NUM_KEYS = ["phone", "number-called", "number called", "number_called", "number", "phone-number-called-from", "phone number called from", "list"];
const QTY_KEYS = ["calls#", "calls", "quantity", "qty"];
const WHO_KEYS = ["who called", "who_called", "who"];
const REASON_KEYS = ["reason", "reasons"];

function pick(obj, keys) {
  const entries = Object.entries(obj);
  // case/space-insensitive match
  for (const [k, v] of entries) {
    const norm = String(k).trim().toLowerCase();
    if (keys.some((needle) => norm === needle || norm.includes(needle))) return v;
  }
  return undefined;
}

function toNumberOrNull(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (!s || s === "#N/A") return null;
  // strip non-numeric (keeps minus and dot)
  const n = Number(s.replace(/[^\d.\-]+/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function normalizeRow(raw) {
  // headers can vary; pick best matches
  const numberRaw = pick(raw, NUM_KEYS);
  const qtyRaw = pick(raw, QTY_KEYS);
  const whoRaw = pick(raw, WHO_KEYS);
  const reasonRaw = pick(raw, REASON_KEYS);

  let numberCalled = numberRaw ? String(numberRaw).trim() : "";
  // normalize scientific like 5.27E+11 to plain
  if (/e\+?/i.test(numberCalled)) {
    const asNum = Number(numberCalled);
    if (Number.isFinite(asNum)) numberCalled = String(Math.trunc(asNum));
  }

  let quantity = toNumberOrNull(qtyRaw);
  // If Google sheet has #N/A or blank, treat as 1 call (better than 0)
  if (quantity === null) quantity = 1;

  const whoCalled = (whoRaw && String(whoRaw).trim()) || "";
  const reason = (reasonRaw && String(reasonRaw).trim()) || "(No Reason)";

  return { numberCalled, quantity, whoCalled, reason };
}

export function aggregateByReason(rows) {
  const map = new Map();
  let total = 0;
  for (const r of rows) {
    const key = r.reason || "(No Reason)";
    const prev = map.get(key) || 0;
    const q = Number(r.quantity) || 0;
    map.set(key, prev + q);
    total += q;
  }
  const arr = Array.from(map.entries())
    .map(([reason, quantity]) => ({ reason, quantity }))
    .sort((a, b) => b.quantity - a.quantity);
  return { total, arr };
}

export function aggregateByNumber(rows) {
  // total calls per phone number
  const map = new Map();
  for (const r of rows) {
    const key = r.numberCalled || "—";
    const prev = map.get(key) || 0;
    const q = Number(r.quantity) || 0;
    map.set(key, prev + q);
  }
  return Array.from(map.entries()).map(([number, total]) => ({
    number,
    total,
  }));
}
