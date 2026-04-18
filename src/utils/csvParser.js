// Tiny CSV parser supporting quoted fields and commas inside quotes.

const BOOL_FIELDS = [
  "pep_status",
  "sanctions_screening_match",
  "adverse_media_flag",
  "documentation_complete",
];

const NUMERIC_FIELDS = ["annual_income"];

function parseLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === ",") {
        out.push(cur);
        cur = "";
      } else if (ch === '"') {
        inQuotes = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

function normalizeValue(field, raw) {
  if (raw === undefined) return null;
  const v = String(raw).trim();
  if (v === "" || v.toUpperCase() === "NULL" || v.toUpperCase() === "N/A") return null;
  if (BOOL_FIELDS.includes(field)) {
    const u = v.toUpperCase();
    if (u === "TRUE") return true;
    if (u === "FALSE") return false;
    return null;
  }
  if (NUMERIC_FIELDS.includes(field)) {
    const n = Number(v.replace(/,/g, ""));
    return Number.isNaN(n) ? null : n;
  }
  return v;
}

export function parseCSV(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return { headers: [], rows: [], error: null };
  const headers = parseLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = parseLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = normalizeValue(h, cells[i]);
    });
    return obj;
  });
  return { headers, rows, error: null };
}
