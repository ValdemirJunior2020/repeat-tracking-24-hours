// src/components/SummaryCards.js
import { Card, Row, Col, Badge } from "react-bootstrap";

export default function SummaryCards({
  totalCalls,
  uniqueNumbers,
  firstTimeCount,
  repeatCount,
  topReason,
}) {
  const pct = (part, whole) =>
    whole > 0 ? Math.round((part / whole) * 100) : 0;

  return (
    <Row className="g-3 mb-3">
      <Col md={3} sm={6}>
        <Card>
          <Card.Body>
            <Card.Subtitle className="text-muted">Total Calls</Card.Subtitle>
            <div className="fs-3 fw-bold mt-1">{totalCalls}</div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} sm={6}>
        <Card>
          <Card.Body>
            <Card.Subtitle className="text-muted">Unique Numbers</Card.Subtitle>
            <div className="fs-3 fw-bold mt-1">{uniqueNumbers}</div>
            <div className="small text-muted">
              distinct phone numbers that called at least once
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} sm={6}>
        <Card>
          <Card.Body>
            <Card.Subtitle className="text-muted">First-Time Callers</Card.Subtitle>
            <div className="d-flex align-items-center gap-2 mt-1">
              <div className="fs-3 fw-bold">{firstTimeCount}</div>
              <Badge bg="success">{pct(firstTimeCount, uniqueNumbers)}%</Badge>
            </div>
            <div className="small text-muted">Numbers that called exactly once</div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} sm={6}>
        <Card>
          <Card.Body>
            <Card.Subtitle className="text-muted">Repeat Callers</Card.Subtitle>
            <div className="d-flex align-items-center gap-2 mt-1">
              <div className="fs-3 fw-bold">{repeatCount}</div>
              <Badge bg="warning" text="dark">
                {pct(repeatCount, uniqueNumbers)}%
              </Badge>
            </div>
            <div className="small text-muted">Numbers with 2+ calls</div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
