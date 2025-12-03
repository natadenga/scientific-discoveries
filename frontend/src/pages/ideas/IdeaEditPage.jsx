import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { ideasAPI, fieldsAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import Loading from '../../components/common/Loading';
import useTitle from '../../hooks/useTitle';

function IdeaEditPage() {
  useTitle('Редагування ідеї');
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ideaResponse, fieldsResponse] = await Promise.all([
          ideasAPI.getBySlug(slug),
          fieldsAPI.getList(),
        ]);

        const idea = ideaResponse.data;

        // Перевіряємо чи користувач є автором
        if (user?.id !== idea.author.id) {
          navigate(`/ideas/${slug}`);
          return;
        }

        setFormData({
          title: idea.title,
          description: idea.description,
          scientific_field_id: idea.scientific_field?.id || '',
          keywords: idea.keywords || '',
          status: idea.status,
          is_public: idea.is_public,
          is_open_for_collaboration: idea.is_open_for_collaboration,
        });

        setFields(fieldsResponse.data.results || fieldsResponse.data);
      } catch (err) {
        setError('Не вдалося завантажити ідею');
        console.error(err);
      }
      setLoading(false);
    };

    fetchData();
  }, [slug, user, navigate]);

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
    setSaving(true);

    try {
      const data = { ...formData };
      if (!data.scientific_field_id) {
        delete data.scientific_field_id;
      }

      const response = await ideasAPI.update(slug, data);
      navigate(`/ideas/${response.data.slug || slug}`);
    } catch (err) {
      if (typeof err.response?.data === 'object') {
        const messages = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(messages);
      } else {
        setError('Помилка оновлення ідеї');
      }
    }

    setSaving(false);
  };

  if (loading) return <Loading />;

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Редагування ідеї</h4>
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
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Збереження...' : 'Зберегти зміни'}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate(`/ideas/${slug}`)}>
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

export default IdeaEditPage;
