import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { contentsAPI, fieldsAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import Loading from '../../components/common/Loading';
import useTitle from '../../hooks/useTitle';

const CONTENT_TYPES = [
  { value: 'idea', label: 'Ідея' },
  { value: 'resource', label: 'Корисний ресурс' },
  { value: 'webinar', label: 'Вебінар' },
  { value: 'lecture', label: 'Гостьова лекція' },
];

function ContentEditPage() {
  useTitle('Редагування');
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    content_type: 'idea',
    title: '',
    description: '',
    link: '',
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
        const [contentResponse, fieldsResponse] = await Promise.all([
          contentsAPI.getBySlug(slug),
          fieldsAPI.getList(),
        ]);

        const content = contentResponse.data;

        // Перевіряємо чи користувач є автором
        if (user?.id !== content.author.id) {
          navigate(`/contents/${slug}`);
          return;
        }

        setFormData({
          content_type: content.content_type,
          title: content.title,
          description: content.description,
          link: content.link || '',
          scientific_field_ids: content.scientific_fields?.map((f) => f.id) || [],
          keywords: content.keywords || '',
          status: content.status,
          is_public: content.is_public,
          is_open_for_collaboration: content.is_open_for_collaboration,
        });

        setFields(fieldsResponse.data.results || fieldsResponse.data);
      } catch (err) {
        setError('Не вдалося завантажити контент');
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

      const response = await contentsAPI.update(slug, data);
      navigate(`/contents/${response.data.slug || slug}`);
    } catch (err) {
      if (typeof err.response?.data === 'object') {
        const messages = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(messages);
      } else {
        setError('Помилка оновлення');
      }
    }

    setSaving(false);
  };

  const requiresLink = ['resource', 'webinar', 'lecture'].includes(formData.content_type);

  const getTypeLabel = () => {
    const type = CONTENT_TYPES.find((t) => t.value === formData.content_type);
    return type?.label || 'Контент';
  };

  if (loading) return <Loading />;

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h4 className="mb-0">Редагування</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" style={{ whiteSpace: 'pre-line' }}>{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Тип контенту *</Form.Label>
                  <Form.Select
                    name="content_type"
                    value={formData.content_type}
                    onChange={handleChange}
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Назва *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Введіть назву"
                    required
                  />
                </Form.Group>

                {requiresLink && (
                  <Form.Group className="mb-3">
                    <Form.Label>Посилання *</Form.Label>
                    <Form.Control
                      type="url"
                      name="link"
                      value={formData.link}
                      onChange={handleChange}
                      placeholder="https://..."
                      required={requiresLink}
                    />
                    <Form.Text className="text-muted">
                      Обов&apos;язкове для {getTypeLabel().toLowerCase()}
                    </Form.Text>
                  </Form.Group>
                )}

                {!requiresLink && (
                  <Form.Group className="mb-3">
                    <Form.Label>Посилання (опціонально)</Form.Label>
                    <Form.Control
                      type="url"
                      name="link"
                      value={formData.link}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Опис *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Детально опишіть..."
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
                    label="Публічний (видимий всім)"
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
                  <Button variant="outline-secondary" onClick={() => navigate(`/contents/${slug}`)}>
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

export default ContentEditPage;
