import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup } from 'react-bootstrap';
import useAuthStore from '../../store/authStore';
import useTitle from '../../hooks/useTitle';
import { institutionsAPI } from '../../api';

function RegisterPage() {
  useTitle('Реєстрація');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    role: 'student',
    institution: '',
    education_level: '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Для автокомпліту закладів освіти
  const [institutions, setInstitutions] = useState([]);
  const [showInstitutions, setShowInstitutions] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  // Завантаження популярних закладів при фокусі або пошук при введенні
  const loadInstitutions = async (query = '') => {
    try {
      const response = await institutionsAPI.search(query);
      setInstitutions(response.data.results || response.data || []);
    } catch {
      setInstitutions([]);
    }
  };

  // Пошук закладів освіти з debounce
  useEffect(() => {
    if (!showInstitutions) return;

    const timeoutId = setTimeout(() => {
      loadInstitutions(formData.institution);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData.institution, showInstitutions]);

  // Завантажити популярні при фокусі
  const handleInstitutionFocus = () => {
    setShowInstitutions(true);
    if (institutions.length === 0) {
      loadInstitutions(formData.institution);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInstitutionSelect = (name) => {
    setFormData({ ...formData, institution: name });
    setShowInstitutions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreeToTerms) {
      setError('Будь ласка, погодьтесь з умовами використання платформи');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError('Паролі не співпадають');
      return;
    }

    setLoading(true);
    const result = await register(formData);

    if (result.success) {
      navigate('/');
    } else {
      // Форматуємо помилки
      if (typeof result.error === 'object') {
        const messages = Object.entries(result.error)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(messages);
      } else {
        setError(result.error);
      }
    }

    setLoading(false);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Реєстрація</h2>

              {error && <Alert variant="danger" style={{ whiteSpace: 'pre-line' }}>{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Імʼя *</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="Ваше імʼя"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Прізвище *</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Ваше прізвище"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Імʼя користувача *</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Унікальний нікнейм"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Пароль *</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        minLength={8}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Підтвердіть пароль *</Form.Label>
                      <Form.Control
                        type="password"
                        name="password_confirm"
                        value={formData.password_confirm}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Роль *</Form.Label>
                  <Form.Select name="role" value={formData.role} onChange={handleChange}>
                    <option value="student">Студент</option>
                    <option value="teacher">Викладач</option>
                    <option value="researcher">Дослідник</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 position-relative">
                  <Form.Label>Заклад освіти</Form.Label>
                  <Form.Control
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    onFocus={handleInstitutionFocus}
                    onBlur={() => setTimeout(() => setShowInstitutions(false), 200)}
                    placeholder="Оберіть або введіть назву закладу..."
                    autoComplete="off"
                  />
                  {showInstitutions && institutions.length > 0 && (
                    <ListGroup
                      className="position-absolute w-100 shadow"
                      style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                    >
                      {institutions.map((inst) => (
                        <ListGroup.Item
                          key={inst.id}
                          action
                          onClick={() => handleInstitutionSelect(inst.name)}
                        >
                          {inst.name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Рівень освіти</Form.Label>
                  <Form.Select name="education_level" value={formData.education_level} onChange={handleChange}>
                    <option value="">Оберіть...</option>
                    <option value="incomplete_secondary">Неповна середня освіта</option>
                    <option value="secondary">Середня освіта</option>
                    <option value="junior_bachelor">Фаховий молодший бакалавр</option>
                    <option value="bachelor">Бакалавр</option>
                    <option value="master">Магістр</option>
                    <option value="phd">Аспірант</option>
                    <option value="candidate">Кандидат наук</option>
                    <option value="doctor_phd">Доктор філософії (PhD)</option>
                    <option value="doctor">Доктор наук</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="agreeToTerms"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    label="Погоджуюсь на розміщення інформації про себе на платформі «Наукові знахідки» публічно"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Реєстрація...' : 'Зареєструватися'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <span className="text-muted">Вже є акаунт? </span>
                <Link to="/login">Увійти</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterPage;
