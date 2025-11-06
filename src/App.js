import { useEffect, useMemo, useState } from "react";
import { Container, Alert, Row, Col, Spinner } from "react-bootstrap";

import HeaderNav from "./components/HeaderNav";
import SummaryCards from "./components/SummaryCards";
import ReasonBar from "./components/ReasonBar";
import TopReasons from "./components/TopReasons";
import DataTable from "./components/DataTable";
import UploadExcel from "./components/UploadExcel";

import { fetchSheetValues } from "./utils/fetchSheet";
import {
  normalizeRow,
  aggregateByReason,
  aggregateByNumber,
} from "./utils/transform";
import { SHEET_NAME } from "./config";
import { loadExclusionMap, normalizePhone } from "./utils/exclusions";

export default function App() {
  const [rawRows, setRawRows] = useState([]);
  const [exMap, setExMap] = useState(new Map());
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

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
          `Could not load data. Check Google Sheet sharing and that /public/exclusion list.xlsx exists. Details: ${
            e.message || e
          }`
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onExcelRows = (json) => {
    setErr("");
    setRawRows(json);
  };

  const normalizedRows = useMemo(
    () =>
      rawRows
        .map(normalizeRow)
        .filter((r) => r.numberCalled || r.reason || r.quantity > 0),
    [rawRows]
  );

  const rows = useMemo(() => {
    if (!normalizedRows.length || exMap.size === 0) return normalizedRows;
    return normalizedRows.map((r) => {
      const key = normalizePhone(r.numberCalled);
      const name = exMap.get(key);
      if (name) {
        const whoCalled = name;
        const reason =
          r.reason && r.reason !== "(No Reason)"
            ? r.reason
            : name.charAt(0).toUpperCase() + name.slice(1);
        return { ...r, whoCalled, reason };
      }
      return r;
    });
  }, [normalizedRows, exMap]);

  const reasonAgg = useMemo(() => aggregateByReason(rows), [rows]);
  const numberAgg = useMemo(() => aggregateByNumber(rows), [rows]);

  const summary = useMemo(() => {
    const uniqueNumbers = numberAgg.length;
    const firstTimeCount = numberAgg.filter(
      (n) => (Number(n.total) || 0) === 1
    ).length;
    const repeatCount = numberAgg.filter(
      (n) => (Number(n.total) || 0) >= 2
    ).length;
    const top = reasonAgg.arr[0]?.reason || "";
    return {
      totalCalls: reasonAgg.total,
      uniqueNumbers,
      firstTimeCount,
      repeatCount,
      topReason: top,
    };
  }, [reasonAgg, numberAgg]);

  // Build a Set for quick “Only Top 10 reasons”
  const top10ReasonSet = useMemo(() => {
    const s = new Set();
    reasonAgg.arr.slice(0, 10).forEach((r) => s.add(r.reason || "(No Reason)"));
    return s;
  }, [reasonAgg]);

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
            {/* KPIs */}
            <SummaryCards
              totalCalls={summary.totalCalls}
              uniqueNumbers={summary.uniqueNumbers}
              firstTimeCount={summary.firstTimeCount}
              repeatCount={summary.repeatCount}
              topReason={summary.topReason}
            />

            {/* Chart FIRST */}
            <ReasonBar dataArr={reasonAgg.arr} />

            {/* Top 10 panel SECOND */}
            <TopReasons dataArr={reasonAgg.arr} />

            {/* Table with pagination + Only Top 10 toggle */}
            <DataTable rows={rows} top10ReasonSet={top10ReasonSet} />
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
