import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaLightbulb, FaUsers, FaHandshake } from 'react-icons/fa';
import useTitle from '../hooks/useTitle';

function HomePage() {
  useTitle(null); // Головна - просто "Наукові Знахідки"

  return (
    <>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold">Наукові Знахідки</h1>
              <p className="lead">
                Платформа для обміну науковими ідеями між студентами та викладачами.
                Діліться своїми ідеями, знаходьте однодумців та співпрацюйте!
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/ideas" variant="light" size="lg">
                  Переглянути ідеї
                </Button>
                <Button as={Link} to="/register" variant="outline-light" size="lg">
                  Приєднатися
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center d-none d-lg-block">
              <FaLightbulb size={200} opacity={0.3} />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <h2 className="text-center mb-5">Можливості платформи</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body>
                <FaLightbulb size={50} className="text-primary mb-3" />
                <Card.Title>Діліться ідеями</Card.Title>
                <Card.Text>
                  Публікуйте свої наукові ідеї, отримуйте відгуки та розвивайте їх разом з іншими.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body>
                <FaUsers size={50} className="text-primary mb-3" />
                <Card.Title>Знаходьте однодумців</Card.Title>
                <Card.Text>
                  Підписуйтесь на цікавих науковців, слідкуйте за їхніми ідеями та досягненнями.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body>
                <FaHandshake size={50} className="text-primary mb-3" />
                <Card.Title>Співпрацюйте</Card.Title>
                <Card.Text>
                  Знаходьте партнерів для спільних досліджень та наукових проєктів.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* CTA Section */}
      <div className="bg-light py-5">
        <Container className="text-center">
          <h2>Готові поділитися своєю ідеєю?</h2>
          <p className="text-muted mb-4">
            Зареєструйтесь безкоштовно та почніть ділитися своїми науковими відкриттями вже сьогодні!
          </p>
          <Button as={Link} to="/register" variant="primary" size="lg">
            Почати зараз
          </Button>
        </Container>
      </div>
    </>
  );
}

export default HomePage;
