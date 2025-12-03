import { Spinner, Container } from 'react-bootstrap';

function Loading({ text = 'Завантаження...' }) {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">{text}</p>
      </div>
    </Container>
  );
}

export default Loading;
