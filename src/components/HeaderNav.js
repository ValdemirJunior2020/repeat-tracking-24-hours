import { Navbar, Container } from "react-bootstrap";

export default function HeaderNav() {
  return (
    <Navbar bg="primary" variant="dark" expand="md" className="mb-3">
      <Container>
        <Navbar.Brand>📞 Repeated Calls Dashboard</Navbar.Brand>
      </Container>
    </Navbar>
  );
}
