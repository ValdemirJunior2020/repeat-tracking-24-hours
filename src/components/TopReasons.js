import { Card, ListGroup, Badge } from "react-bootstrap";

export default function TopReasons({ dataArr = [], limit = 10 }) {
  const top = dataArr.slice(0, limit);

  if (!top.length) return null;

  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title className="mb-2">Top {limit} Reasons</Card.Title>
        <ListGroup variant="flush">
          {top.map((r, i) => (
            <ListGroup.Item
              key={r.reason || i}
              className="d-flex justify-content-between align-items-center"
            >
              <span className="text-truncate" title={r.reason}>
                {i + 1}. {r.reason || "(No Reason)"}
              </span>
              <Badge bg="primary">{r.quantity}</Badge>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
