import { buildValuesUrl } from "../config";

/**
 * Fetches data directly from Google Sheets API v4 (values.get).
 * Uses your .env: REACT_APP_SHEETS_API_KEY, REACT_APP_SHEET_ID, REACT_APP_SHEET_NAME.
 */
export async function fetchSheetValues() {
  const url = buildValuesUrl();
  const res = await fetch(url);

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Sheets API error ${res.status}: ${msg}`);
  }

  const json = await res.json();
  const rows = json.values || [];
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => String(h || "").trim());
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = r[idx] ?? "";
    });
    data.push(obj);
  }

  return data;
}
