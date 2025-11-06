import { useMemo, useState } from "react";
import { Card, Table, Form, Row, Col, Pagination, Badge } from "react-bootstrap";

export default function DataTable({ rows, top10ReasonSet }) {
  const [q, setQ] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");
  const [onlyTop10, setOnlyTop10] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);

  // distinct reason list for dropdown
  const reasons = useMemo(() => {
    const s = new Set();
    rows.forEach((r) => s.add(r.reason || "(No Reason)"));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // search + filters
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const out = rows.filter((r) => {
      const hitsQuery =
        !query ||
        (r.numberCalled || "").toLowerCase().includes(query) ||
        String(r.quantity).includes(query) ||
        (r.whoCalled || "").toLowerCase().includes(query) ||
        (r.reason || "").toLowerCase().includes(query);

      const hitsReason =
        !reasonFilter || (r.reason || "(No Reason)") === reasonFilter;

      const hitsTop10 =
        !onlyTop10 || top10ReasonSet.has(r.reason || "(No Reason)");

      return hitsQuery && hitsReason && hitsTop10;
    });
    return out;
  }, [rows, q, reasonFilter, onlyTop10, top10ReasonSet]);

  // pagination math
  const total = filtered.length;
  const totalPages = pageSize === "All" ? 1 : Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    if (pageSize === "All") return filtered;
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // pagination UI builder
  const renderPager = () => {
    if (totalPages <= 1) return null;
    const items = [];
    const go = (p) => () => setPage(p);

    items.push(
      <Pagination.First key="first" disabled={currentPage === 1} onClick={go(1)} />
    );
    items.push(
      <Pagination.Prev key="prev" disabled={currentPage === 1} onClick={go(currentPage - 1)} />
    );

    const windowSize = 5;
    const start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    for (let p = start; p <= end; p++) {
      items.push(
        <Pagination.Item key={p} active={p === currentPage} onClick={go(p)}>
          {p}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages}
        onClick={go(currentPage + 1)}
      />
    );
    items.push(
      <Pagination.Last
        key="last"
        disabled={currentPage === totalPages}
        onClick={go(totalPages)}
      />
    );

    return <Pagination className="mb-0">{items}</Pagination>;
  };

  return (
    <Card className="mt-3" id="table">
      <Card.Body>
        <Row className="g-2 align-items-center mb-3">
          <Col md={4} sm={12}>
            <Form.Control
              placeholder="Search number, reason, who called..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </Col>
          <Col md={3} sm={6}>
            <Form.Select
              value={reasonFilter}
              onChange={(e) => {
                setReasonFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Reasons</option>
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3} sm={6} className="d-flex align-items-center gap-2">
            <Form.Check
              type="switch"
              id="onlyTop10"
              label="Only Top 10 reasons"
              checked={onlyTop10}
              onChange={(e) => {
                setOnlyTop10(e.target.checked);
                setPage(1);
              }}
            />
          </Col>
          <Col md={2} className="text-md-end">
            <Form.Select
              value={pageSize}
              onChange={(e) => {
                const v = e.target.value === "All" ? "All" : Number(e.target.value);
                setPageSize(v);
                setPage(1);
              }}
              aria-label="Rows per page"
            >
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
              <option value={"All"}>All</option>
            </Form.Select>
          </Col>
        </Row>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="text-muted small">
            Showing <Badge bg="secondary">{paged.length}</Badge> of{" "}
            <Badge bg="secondary">{total}</Badge> rows
          </div>
          {renderPager()}
        </div>

        <Table hover responsive size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Number Called (A)</th>
              <th>Quantity (C)</th>
              <th>Who Called (D)</th>
              <th>Reason (E)</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r, i) => (
              <tr key={`${r.numberCalled}-${i}`}>
                <td>{(pageSize === "All" ? 0 : (currentPage - 1) * pageSize) + i + 1}</td>
                <td>{r.numberCalled || "—"}</td>
                <td>{Number.isFinite(r.quantity) ? r.quantity : "—"}</td>
                <td>{r.whoCalled || "—"}</td>
                <td>{r.reason || "(No Reason)"}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="d-flex justify-content-end">{renderPager()}</div>
      </Card.Body>
    </Card>
  );
}
