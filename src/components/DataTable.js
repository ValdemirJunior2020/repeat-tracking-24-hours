import { useMemo, useState } from "react";
import { Card, Table, Form, Row, Col, Badge } from "react-bootstrap";

export default function DataTable({ rows }) {
  const [q, setQ] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");

  const reasons = useMemo(() => {
    const s = new Set();
    rows.forEach((r) => s.add(r.reason || "(No Reason)"));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      const hitsQuery =
        !query ||
        r.numberCalled.toLowerCase().includes(query) ||
        String(r.quantity).includes(query) ||
        (r.whoCalled || "").toLowerCase().includes(query) ||
        (r.reason || "").toLowerCase().includes(query);
      const hitsReason = !reasonFilter || (r.reason || "(No Reason)") === reasonFilter;
      return hitsQuery && hitsReason;
    });
  }, [rows, q, reasonFilter]);

  return (
    <Card className="mt-3">
      <Card.Body>
        <Row className="g-2 mb-3">
          <Col md={6}>
            <Form.Control
              placeholder="Search number, reason, who called..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </Col>
          <Col md={6}>
            <Form.Select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
            >
              <option value="">All Reasons</option>
              {reasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>

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
            {filtered.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{r.numberCalled || "—"}</td>
                <td>{Number.isFinite(r.quantity) ? r.quantity : "—"}</td>
                <td>
                  {r.whoCalled || "—"}
                </td>
                <td>
                  {r.reason || "(No Reason)"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
