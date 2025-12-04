import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaLightbulb, FaUsers, FaHandshake, FaBook, FaVideo, FaChalkboardTeacher } from 'react-icons/fa';
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
                Платформа для обміну науковим контентом між студентами та викладачами.
                Діліться ідеями, ресурсами, вебінарами та лекціями!
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/contents?type=idea" variant="light" size="lg">
                  Переглянути контент
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

      {/* Content Types Section */}
      <Container className="py-5">
        <h2 className="text-center mb-5">Типи контенту</h2>
        <Row>
          <Col md={3} className="mb-4">
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body>
                <FaLightbulb size={40} className="text-primary mb-3" />
                <Card.Title>Ідеї</Card.Title>
                <Card.Text className="small">
                  Наукові ідеї та пропозиції для досліджень
                </Card.Text>
                <Button as={Link} to="/contents?type=idea" variant="outline-primary" size="sm">
                  Переглянути
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body>
                <FaBook size={40} className="text-success mb-3" />
                <Card.Title>Ресурси</Card.Title>
                <Card.Text className="small">
                  Корисні матеріали, статті та посилання
                </Card.Text>
                <Button as={Link} to="/contents?type=resource" variant="outline-success" size="sm">
                  Переглянути
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body>
                <FaVideo size={40} className="text-info mb-3" />
                <Card.Title>Вебінари</Card.Title>
                <Card.Text className="small">
                  Онлайн-заходи та записи вебінарів
                </Card.Text>
                <Button as={Link} to="/contents?type=webinar" variant="outline-info" size="sm">
                  Переглянути
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body>
                <FaChalkboardTeacher size={40} className="text-warning mb-3" />
                <Card.Title>Лекції</Card.Title>
                <Card.Text className="small">
                  Гостьові лекції від експертів
                </Card.Text>
                <Button as={Link} to="/contents?type=lecture" variant="outline-warning" size="sm">
                  Переглянути
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Features Section */}
      <div className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-5">Можливості платформи</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0">
                <Card.Body>
                  <FaLightbulb size={50} className="text-primary mb-3" />
                  <Card.Title>Діліться контентом</Card.Title>
                  <Card.Text>
                    Публікуйте наукові ідеї, ресурси, вебінари та лекції. Отримуйте відгуки та розвивайте їх разом з іншими.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0">
                <Card.Body>
                  <FaUsers size={50} className="text-primary mb-3" />
                  <Card.Title>Знаходьте однодумців</Card.Title>
                  <Card.Text>
                    Підписуйтесь на цікавих науковців, слідкуйте за їхнім контентом та досягненнями.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0">
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
      </div>

      {/* CTA Section */}
      <Container className="py-5 text-center">
        <h2>Готові поділитися своїми знахідками?</h2>
        <p className="text-muted mb-4">
          Зареєструйтесь безкоштовно та почніть ділитися науковим контентом вже сьогодні!
        </p>
        <Button as={Link} to="/register" variant="primary" size="lg">
          Почати зараз
        </Button>
      </Container>
    </>
  );
}

export default HomePage;
