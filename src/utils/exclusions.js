// src/utils/exclusions.js
import * as XLSX from "xlsx";

// keep only digits for consistent matching (e.g., "1-561..." -> "1561...")
export const normalizePhone = (v) => String(v ?? "").replace(/\D+/g, "").trim();

/**
 * Loads /public/exclusion list.xlsx and returns a Map<normalizedPhone, nameFromColC>
 * - Column A: phone number
 * - Column C: caller name
 * - Skips empty rows and headers automatically
 */
export async function loadExclusionMap() {
  // NOTE: space in filename is URL-encoded
  const res = await fetch("/exclusion%20list.xlsx");
  if (!res.ok) {
    console.warn("[Exclusions] Could not fetch /exclusion list.xlsx:", res.status);
    return new Map();
  }
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];

  // rows as arrays: [[A1,B1,C1,...],[A2,B2,C2,...],...]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });

  const map = new Map();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const a = row[0]; // Column A (phone)
    const c = row[2]; // Column C (name)
    const phoneNorm = normalizePhone(a);
    const name = String(c ?? "").trim();
    if (phoneNorm && name) {
      map.set(phoneNorm, name);
    }
  }
  console.log(`[Exclusions] Loaded ${map.size} phone → name overrides`);
  return map;
}
