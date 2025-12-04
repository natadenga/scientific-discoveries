import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Form, InputGroup, Button, Nav } from 'react-bootstrap';
import { FaSearch, FaEye, FaHeart, FaComment, FaExternalLinkAlt } from 'react-icons/fa';
import { contentsAPI, fieldsAPI } from '../../api';
import Loading from '../../components/common/Loading';
import useTitle from '../../hooks/useTitle';

const CONTENT_TYPES = [
  { value: '', label: 'Всі' },
  { value: 'idea', label: 'Ідеї' },
  { value: 'resource', label: 'Ресурси' },
  { value: 'webinar', label: 'Вебінари' },
  { value: 'lecture', label: 'Лекції' },
];

const getContentTypeLabel = (type) => {
  const labels = {
    idea: 'Ідея',
    resource: 'Ресурс',
    webinar: 'Вебінар',
    lecture: 'Лекція',
  };
  return labels[type] || type;
};

const getContentTypeVariant = (type) => {
  const variants = {
    idea: 'primary',
    resource: 'success',
    webinar: 'info',
    lecture: 'warning',
  };
  return variants[type] || 'secondary';
};

function ContentsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const contentType = searchParams.get('type') || '';

  useTitle(contentType ? getContentTypeLabel(contentType) : 'Контент');

  const [contents, setContents] = useState([]);
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
        setFields(response.data.results || response.data);
      } catch (error) {
        console.error('Error loading fields:', error);
      }
    };
    fetchFields();
  }, []);

  // Завантаження контенту при зміні фільтрів
  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (selectedField) params.scientific_field__slug = selectedField;
        if (status) params.status = status;
        if (contentType) params.content_type = contentType;

        const response = await contentsAPI.getList(params);
        setContents(response.data.results || response.data);
      } catch (error) {
        console.error('Error loading contents:', error);
      }
      setLoading(false);
    };
    fetchContents();
  }, [selectedField, status, search, contentType]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Пошук вже відбувається через useEffect при зміні search
  };

  const handleTypeChange = (type) => {
    if (type) {
      setSearchParams({ type });
    } else {
      setSearchParams({});
    }
  };

  const getStatusBadge = (contentStatus) => {
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
    return <Badge bg={variants[contentStatus]}>{labels[contentStatus]}</Badge>;
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{contentType ? getContentTypeLabel(contentType) : 'Науковий контент'}</h1>
        <Button as={Link} to="/contents/create" variant="primary">
          + Додати
        </Button>
      </div>

      {/* Табки типів контенту */}
      <Nav variant="tabs" className="mb-4">
        {CONTENT_TYPES.map((type) => (
          <Nav.Item key={type.value}>
            <Nav.Link
              active={contentType === type.value}
              onClick={() => handleTypeChange(type.value)}
              style={{ cursor: 'pointer' }}
            >
              {type.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

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

      {/* Список контенту */}
      {loading ? (
        <Loading />
      ) : contents.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <p className="text-muted mb-0">Контент не знайдено</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {contents.map((content) => (
            <Col key={content.id} md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <Badge bg={getContentTypeVariant(content.content_type)} className="me-2">
                        {getContentTypeLabel(content.content_type)}
                      </Badge>
                      {getStatusBadge(content.status)}
                    </div>
                    {content.is_open_for_collaboration && (
                      <Badge bg="info">Шукаю співпрацю</Badge>
                    )}
                  </div>
                  <Card.Title>
                    <Link to={`/contents/${content.slug}`} className="text-decoration-none">
                      {content.title}
                    </Link>
                    {content.link && (
                      <a
                        href={content.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ms-2 text-muted"
                        title="Зовнішнє посилання"
                      >
                        <FaExternalLinkAlt size={12} />
                      </a>
                    )}
                  </Card.Title>
                  {content.scientific_fields && content.scientific_fields.length > 0 && (
                    <small className="text-muted d-block mb-2">
                      {content.scientific_fields.map((f) => f.name).join(', ')}
                    </small>
                  )}
                  <div className="d-flex align-items-center text-muted small">
                    <Link to={`/users/${content.author.id}`} className="text-decoration-none me-3">
                      {content.author.full_name || content.author.username}
                    </Link>
                    <span className="me-3">
                      <FaEye className="me-1" />
                      {content.views_count}
                    </span>
                    <span className="me-3">
                      <FaHeart className="me-1" />
                      {content.likes_count}
                    </span>
                    <span>
                      <FaComment className="me-1" />
                      {content.comments_count}
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

export default ContentsListPage;
