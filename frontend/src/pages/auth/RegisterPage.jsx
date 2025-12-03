import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import useAuthStore from '../../store/authStore';
import useTitle from '../../hooks/useTitle';

function RegisterPage() {
  useTitle('Реєстрація');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    role: 'student',
    institution: '',
    education_level: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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

                <Form.Group className="mb-3">
                  <Form.Label>Навчальний заклад</Form.Label>
                  <Form.Control
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="Університет / Інститут"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Рівень освіти</Form.Label>
                  <Form.Select name="education_level" value={formData.education_level} onChange={handleChange}>
                    <option value="">Оберіть...</option>
                    <option value="bachelor">Бакалавр</option>
                    <option value="master">Магістр</option>
                    <option value="phd">Аспірант / PhD</option>
                    <option value="doctor">Доктор наук</option>
                  </Form.Select>
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
