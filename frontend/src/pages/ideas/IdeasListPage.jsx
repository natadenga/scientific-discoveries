import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch, FaEye, FaHeart, FaComment } from 'react-icons/fa';
import { ideasAPI, fieldsAPI } from '../../api';
import Loading from '../../components/common/Loading';
import useTitle from '../../hooks/useTitle';

function IdeasListPage() {
  useTitle('Ідеї');
  const [ideas, setIdeas] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [status, setStatus] = useState('');

  // Завантаження галузей - один раз при монтуванні
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await fieldsAPI.getList();
        setFields(response.data);
      } catch (error) {
        console.error('Error loading fields:', error);
      }
    };
    fetchFields();
  }, []);

  // Завантаження ідей при зміні фільтрів
  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (selectedField) params.scientific_field__slug = selectedField;
        if (status) params.status = status;

        const response = await ideasAPI.getList(params);
        setIdeas(response.data);
      } catch (error) {
        console.error('Error loading ideas:', error);
      }
      setLoading(false);
    };
    fetchIdeas();
  }, [selectedField, status, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Пошук вже відбувається через useEffect при зміні search
  };

  const getStatusBadge = (ideaStatus) => {
    const variants = {
      idea: 'primary',
      in_progress: 'warning',
      completed: 'success',
    };
    const labels = {
      idea: 'Ідея',
      in_progress: 'У процесі',
      completed: 'Завершено',
    };
    return <Badge bg={variants[ideaStatus]}>{labels[ideaStatus]}</Badge>;
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Наукові ідеї</h1>
        <Button as={Link} to="/ideas/create" variant="primary">
          + Нова ідея
        </Button>
      </div>

      {/* Фільтри */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={4}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Пошук..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button type="submit" variant="outline-primary">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Col>
              <Col md={4}>
                <Form.Select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                >
                  <option value="">Всі галузі</option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.slug}>
                      {field.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">Всі статуси</option>
                  <option value="idea">Ідея</option>
                  <option value="in_progress">У процесі</option>
                  <option value="completed">Завершено</option>
                </Form.Select>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Список ідей */}
      {loading ? (
        <Loading />
      ) : ideas.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <p className="text-muted mb-0">Ідеї не знайдено</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {ideas.map((idea) => (
            <Col key={idea.id} md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    {getStatusBadge(idea.status)}
                    {idea.is_open_for_collaboration && (
                      <Badge bg="info">Шукаю співпрацю</Badge>
                    )}
                  </div>
                  <Card.Title>
                    <Link to={`/ideas/${idea.slug}`} className="text-decoration-none">
                      {idea.title}
                    </Link>
                  </Card.Title>
                  {idea.scientific_field && (
                    <small className="text-muted d-block mb-2">
                      {idea.scientific_field.name}
                    </small>
                  )}
                  <div className="d-flex align-items-center text-muted small">
                    <Link to={`/users/${idea.author.id}`} className="text-decoration-none me-3">
                      {idea.author.username}
                    </Link>
                    <span className="me-3">
                      <FaEye className="me-1" />
                      {idea.views_count}
                    </span>
                    <span className="me-3">
                      <FaHeart className="me-1" />
                      {idea.likes_count}
                    </span>
                    <span>
                      <FaComment className="me-1" />
                      {idea.comments_count}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default IdeasListPage;
