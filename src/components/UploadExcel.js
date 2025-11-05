import * as XLSX from "xlsx";
import { Button } from "react-bootstrap";

/**
 * Optional: lets you load your local Excel file
 * (“24 hours - Report- Repeated Calls .xlsx”) if the Google Sheet isn’t public yet.
 */
export default function UploadExcel({ onRows }) {
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const name = wb.SheetNames[0];
    const json = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "" });
    onRows(json);
  };

  return (
    <>
      <input
        id="excel-input"
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={onFile}
      />
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => document.getElementById("excel-input").click()}
      >
        Load Excel (fallback)
      </Button>
    </>
  );
}
