import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { ideasAPI, fieldsAPI } from '../../api';
import useTitle from '../../hooks/useTitle';

function IdeaCreatePage() {
  useTitle('Нова ідея');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scientific_field_id: '',
    keywords: '',
    status: 'idea',
    is_public: true,
    is_open_for_collaboration: false,
  });
  const [fields, setFields] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await fieldsAPI.getList();
        setFields(response.data);
      } catch (err) {
        console.error('Error loading fields:', err);
      }
    };
    fetchFields();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = { ...formData };
      if (!data.scientific_field_id) {
        delete data.scientific_field_id;
      }

      const response = await ideasAPI.create(data);
      navigate(`/ideas/${response.data.slug || response.data.id}`);
    } catch (err) {
      if (typeof err.response?.data === 'object') {
        const messages = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(messages);
      } else {
        setError('Помилка створення ідеї');
      }
    }

    setLoading(false);
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Нова ідея</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" style={{ whiteSpace: 'pre-line' }}>{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Назва *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Введіть назву вашої ідеї"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Опис *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Детально опишіть вашу ідею..."
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Галузь науки</Form.Label>
                      <Form.Select
                        name="scientific_field_id"
                        value={formData.scientific_field_id}
                        onChange={handleChange}
                      >
                        <option value="">Оберіть галузь...</option>
                        {fields.map((field) => (
                          <option key={field.id} value={field.id}>
                            {field.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Статус</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="idea">Ідея</option>
                        <option value="in_progress">У процесі</option>
                        <option value="completed">Завершено</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Ключові слова</Form.Label>
                  <Form.Control
                    type="text"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    placeholder="AI, машинне навчання, нейронні мережі"
                  />
                  <Form.Text className="text-muted">
                    Введіть ключові слова через кому
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleChange}
                    label="Публічна ідея (видима всім)"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    name="is_open_for_collaboration"
                    checked={formData.is_open_for_collaboration}
                    onChange={handleChange}
                    label="Шукаю співпрацю"
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? 'Створення...' : 'Створити ідею'}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                    Скасувати
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default IdeaCreatePage;
