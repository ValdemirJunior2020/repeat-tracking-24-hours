import { useEffect, useMemo, useState } from "react";
import { Container, Alert, Row, Col, Spinner } from "react-bootstrap";

import HeaderNav from "./components/HeaderNav";
import SummaryCards from "./components/SummaryCards";
import ReasonBar from "./components/ReasonBar";
import DataTable from "./components/DataTable";
import UploadExcel from "./components/UploadExcel"; // optional fallback

import { fetchSheetValues } from "./utils/fetchSheet";
import { normalizeRow, aggregateByReason, aggregateByNumber } from "./utils/transform";
import { SHEET_NAME } from "./config";
import { loadExclusionMap, normalizePhone } from "./utils/exclusions";

export default function App() {
  const [rawRows, setRawRows] = useState([]);
  const [exMap, setExMap] = useState(new Map());
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Load Google Sheet + Exclusion list Excel (public/exclusion list.xlsx)
  useEffect(() => {
    (async () => {
      try {
        const [sheetData, exclusions] = await Promise.all([
          fetchSheetValues(),
          loadExclusionMap(),
        ]);
        setRawRows(sheetData);
        setExMap(exclusions);
      } catch (e) {
        setErr(
          `Could not load data. ` +
            `Check the Google Sheet sharing and that /public/exclusion list.xlsx exists. ` +
            `Details: ${e.message || e}`
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Optional: allow loading a local Excel if the Sheet isn’t public yet
  const onExcelRows = (json) => {
    setErr("");
    setRawRows(json);
  };

  // Normalize rows to the 4 fields we care about
  const normalizedRows = useMemo(
    () =>
      rawRows
        .map(normalizeRow)
        .filter((r) => r.numberCalled || r.reason || r.quantity > 0),
    [rawRows]
  );

  // Apply exclusions: if phone in exclusion map, override whoCalled with name from Col C
  const rows = useMemo(() => {
    if (!normalizedRows.length || exMap.size === 0) return normalizedRows;
    return normalizedRows.map((r) => {
      const key = normalizePhone(r.numberCalled);
      const name = exMap.get(key);
      if (name) {
        return { ...r, whoCalled: name }; // override D
      }
      return r;
    });
  }, [normalizedRows, exMap]);

  const reasonAgg = useMemo(() => aggregateByReason(rows), [rows]);
  const numberAgg = useMemo(() => aggregateByNumber(rows), [rows]);

  const summary = useMemo(() => {
    const top = reasonAgg.arr[0]?.reason || "";
    return {
      totalCalls: reasonAgg.total,
      uniqueNumbers: numberAgg.length,
      topReason: top,
    };
  }, [reasonAgg, numberAgg]);

  return (
    <>
      <HeaderNav />
      <Container className="pb-5">
        <Row className="align-items-center mb-2">
          <Col>
            <h4 className="mb-0">📞 Repeated Calls Dashboard</h4>
            <div className="text-muted small">Source tab: “{SHEET_NAME}”</div>
          </Col>
          <Col className="text-end">
            <UploadExcel onRows={onExcelRows} />
          </Col>
        </Row>

        {loading && (
          <div className="d-flex align-items-center gap-2">
            <Spinner animation="border" size="sm" />
            <span>Loading data…</span>
          </div>
        )}

        {!loading && err && (
          <Alert variant="warning" className="mt-2">
            {err}
          </Alert>
        )}

        {!loading && rows.length > 0 && (
          <>
            <SummaryCards
              totalCalls={summary.totalCalls}
              uniqueNumbers={summary.uniqueNumbers}
              topReason={summary.topReason}
            />
            <ReasonBar dataArr={reasonAgg.arr} />
            <DataTable rows={rows} />
          </>
        )}

        {!loading && !err && rows.length === 0 && (
          <Alert variant="secondary" className="mt-3">
            No rows found. Double-check the header row and the tab name.
          </Alert>
        )}
      </Container>
    </>
  );
}
