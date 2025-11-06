// src/components/SummaryCards.js
import { Card, Row, Col, Badge } from "react-bootstrap";

function StatCard({ title, value, sub, variant = "light" }) {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="text-muted small">{title}</div>
        <div className="fs-3 fw-semibold">{value}</div>
        {sub ? <div className="text-muted">{sub}</div> : null}
      </Card.Body>
    </Card>
  );
}

export default function SummaryCards({
  totalCalls = 0,
  uniqueNumbers = 0,
  firstTimeCount = 0,
  repeatCount = 0,
}) {
  const repeatRate =
    uniqueNumbers > 0 ? Math.round((repeatCount / uniqueNumbers) * 100) : 0;
  const firstRate =
    uniqueNumbers > 0 ? Math.round((firstTimeCount / uniqueNumbers) * 100) : 0;

  return (
    <Row className="g-3 mt-2">
      <Col xs={12} md={3}>
        <StatCard title="Total Calls" value={totalCalls} />
      </Col>
      <Col xs={12} md={3}>
        <StatCard title="Unique Numbers" value={uniqueNumbers} />
      </Col>
      <Col xs={12} md={3}>
        <StatCard
          title="First-Time Callers"
          value={
            <>
              {firstTimeCount}{" "}
              <Badge bg="success" className="align-middle">
                {firstRate}%
              </Badge>
            </>
          }
          sub="Numbers that called exactly once"
        />
      </Col>
      <Col xs={12} md={3}>
        <StatCard
          title="Repeat Callers"
          value={
            <>
              {repeatCount}{" "}
              <Badge bg="warning" text="dark" className="align-middle">
                {repeatRate}%
              </Badge>
            </>
          }
          sub="Numbers with 2+ calls"
        />
      </Col>
    </Row>
  );
}
