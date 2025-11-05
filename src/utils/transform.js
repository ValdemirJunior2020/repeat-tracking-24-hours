// src/utils/transform.js

// ---------- helpers ----------
const normKey = (s) => String(s || "").trim().toLowerCase();

// treat #N/A, empty, null as empty
const cleanVal = (v) => {
  const s = String(v ?? "").trim();
  if (!s || s.toUpperCase() === "#N/A") return "";
  return s;
};

// convert scientific notation like "5.27E+11" -> "527000000000"
function expandSciIfNeeded(v) {
  const s = String(v ?? "").trim();
  if (!s) return "";
  if (!/^\d+(\.\d+)?e\+\d+$/i.test(s)) return s;
  try {
    // simple converter (positive exponent only, as seen in the sheet)
    const [intPart, expPart] = s.toLowerCase().split("e+");
    const [whole, frac = ""] = intPart.split(".");
    const shift = Number(expPart);
    const raw = whole + frac;                 // remove decimal
    const zeros = Math.max(0, shift - frac.length);
    return raw + "0".repeat(zeros);
  } catch {
    return s;
  }
}

// counts must be small integers (avoid phones)
const parseCount = (v) => {
  const s = String(v ?? "").trim();
  if (!s || s.toUpperCase() === "#N/A") return null;
  // accept 1–3 digits only (0..999)
  if (/^\d{1,3}$/.test(s)) {
    const n = Number(s);
    if (Number.isFinite(n) && n >= 0 && n <= 999) return n;
  }
  return null;
};

// ---------- normalizer ----------
export function normalizeRow(row) {
  // case-insensitive map
  const m = {};
  for (const [k, v] of Object.entries(row)) m[normKey(k)] = v;

  // PHONE (A/B) — keep as string + expand "5.27E+11"
  const rawPhone =
    m["number-called"] ??
    m["number called"] ??
    m["phone-number-called-from"] ??
    m["phone number called from"] ??
    m["phone"] ??
    m["list"] ??
    "";
  let numberCalled = cleanVal(rawPhone);
  numberCalled = expandSciIfNeeded(numberCalled);

  // QUANTITY (C preferred; fallback to numeric "Who called")
  const callsHash = parseCount(m["calls#"]);
  const whoCalledAsCount = parseCount(m["who called"]);
  const quantity = callsHash ?? whoCalledAsCount ?? 0;

  // WHO CALLED (text only if not numeric)
  const whoRaw = cleanVal(m["who called"]);
  const whoCalled = parseCount(whoRaw) === null ? whoRaw : "";

  // REASON (E). If blank, optionally fallback to whoCalled (so “expedia” becomes a reason)
  let reason = cleanVal(m["reason"]);
  if (!reason && whoCalled) {
    // Fallback so blank reasons get something meaningful like "Expedia"
    reason = whoCalled.charAt(0).toUpperCase() + whoCalled.slice(1);
  }
  if (!reason) reason = "(No Reason)";

  // Optional: Itinerary (F)
  const itin = cleanVal(m["itin#"]) || "";

  return { numberCalled, quantity, whoCalled, reason, itin };
}

// ---------- aggregations ----------
export function aggregateByReason(rows) {
  const byReason = new Map();
  let total = 0;
  for (const r of rows) {
    const qty = Number(r.quantity) || 0;
    total += qty;
    const key = r.reason || "(No Reason)";
    byReason.set(key, (byReason.get(key) || 0) + qty);
  }
  const arr = Array.from(byReason, ([reason, quantity]) => ({ reason, quantity }))
    .sort((a, b) => b.quantity - a.quantity);
  return { arr, total };
}

export function aggregateByNumber(rows) {
  const byNumber = new Map();
  for (const r of rows) {
    const phone = r.numberCalled || "(No Number)";
    const qty = Number(r.quantity) || 0;
    if (!byNumber.has(phone)) byNumber.set(phone, { number: phone, total: 0, reasons: new Map() });
    const rec = byNumber.get(phone);
    rec.total += qty;
    const rk = r.reason || "(No Reason)";
    rec.reasons.set(rk, (rec.reasons.get(rk) || 0) + qty);
  }
  return Array.from(byNumber.values())
    .map((x) => ({
      number: x.number,
      total: x.total,
      reasons: Array.from(x.reasons, ([reason, qty]) => ({ reason, qty })).sort((a, b) => b.qty - a.qty),
    }))
    .sort((a, b) => b.total - a.total);
}
