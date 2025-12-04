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
    scientific_field_ids: [],
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
          scientific_field_ids: idea.scientific_fields?.map((f) => f.id) || [],
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

  const handleFieldToggle = (fieldId) => {
    setFormData((prev) => {
      const ids = prev.scientific_field_ids;
      if (ids.includes(fieldId)) {
        return { ...prev, scientific_field_ids: ids.filter((id) => id !== fieldId) };
      } else {
        return { ...prev, scientific_field_ids: [...ids, fieldId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = { ...formData };
      if (data.scientific_field_ids.length === 0) {
        delete data.scientific_field_ids;
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

                <Form.Group className="mb-3">
                  <Form.Label>Галузі науки</Form.Label>
                  <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {fields.map((field) => (
                      <Form.Check
                        key={field.id}
                        type="checkbox"
                        id={`field-${field.id}`}
                        label={field.name}
                        checked={formData.scientific_field_ids.includes(field.id)}
                        onChange={() => handleFieldToggle(field.id)}
                      />
                    ))}
                  </div>
                  <Form.Text className="text-muted">
                    Оберіть одну або кілька галузей науки
                  </Form.Text>
                </Form.Group>

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
