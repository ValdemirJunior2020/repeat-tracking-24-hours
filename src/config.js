export const SHEET_ID = process.env.REACT_APP_SHEET_ID;
export const SHEET_NAME = process.env.REACT_APP_SHEET_NAME; // should be "Sheet1"
export const SHEETS_API_KEY = process.env.REACT_APP_SHEETS_API_KEY;

// A1 helpers
function a1Escape(name) {
  return String(name || "").replace(/'/g, "''");
}
function a1TabRef(name) {
  const n = a1Escape(name);
  const needsQuotes = /[^\w]/.test(n); // spaces/symbols need quotes
  return needsQuotes ? `'${n}'` : n;
}

export function buildValuesUrl() {
  const tabRef = a1TabRef(SHEET_NAME);
  const range = `${tabRef}!A:E`;
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    SHEET_ID
  )}/values/${encodeURIComponent(range)}`;
  const url = `${base}?key=${encodeURIComponent(SHEETS_API_KEY)}`;

  // DEBUG: see exactly what the app is requesting
  // (open DevTools console to verify you see Sheet1!A:E)
  console.log("[Sheets] range =", range);
  console.log("[Sheets] url   =", url);

  return url;
}
