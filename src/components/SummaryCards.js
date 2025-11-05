import { Card, Col, Row } from "react-bootstrap";

export default function SummaryCards({ totalCalls, uniqueNumbers, topReason }) {
  return (
    <Row className="g-3">
      <Col md={4}>
        <Card>
          <Card.Body>
            <div className="text-muted">Total Calls</div>
            <h3 className="m-0">{totalCalls}</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card>
          <Card.Body>
            <div className="text-muted">Unique Numbers</div>
            <h3 className="m-0">{uniqueNumbers}</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card>
          <Card.Body>
            <div className="text-muted">Top Reason</div>
            <h6 className="m-0">{topReason || "—"}</h6>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
