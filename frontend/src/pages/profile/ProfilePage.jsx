import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Tab, Tabs } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { usersAPI } from '../../api/users';
import { ideasAPI } from '../../api/ideas';
import useTitle from '../../hooks/useTitle';

function ProfilePage() {
  useTitle('Мій профіль');
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    scientific_interests: '',
    publications: '',
    orcid: '',
    google_scholar: '',
  });
  const [myIdeas, setMyIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        scientific_interests: user.scientific_interests || '',
        publications: user.publications || '',
        orcid: user.orcid || '',
        google_scholar: user.google_scholar || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchMyIdeas = async () => {
      try {
        const response = await ideasAPI.getMy();
        setMyIdeas(response.data.results || response.data);
      } catch (err) {
        console.error('Error fetching ideas:', err);
      }
    };
    fetchMyIdeas();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await usersAPI.updateProfile(formData);
      updateUser(response.data);
      setSuccess('Профіль успішно оновлено!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Помилка оновлення профілю');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      student: 'Студент',
      teacher: 'Викладач',
      researcher: 'Дослідник',
    };
    return roles[role] || role;
  };

  const getEducationLabel = (level) => {
    const levels = {
      incomplete_secondary: 'Неповна середня освіта',
      secondary: 'Середня освіта',
      bachelor: 'Бакалавр',
      master: 'Магістр',
      phd: 'Аспірант / PhD',
      doctor: 'Доктор наук',
    };
    return levels[level] || level;
  };

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">Будь ласка, увійдіть в акаунт</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Body className="text-center">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  roundedCircle
                  width={120}
                  height={120}
                  className="mb-3"
                />
              ) : (
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: 120, height: 120, fontSize: '3rem' }}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <h4>{user.username}</h4>
              <p className="text-muted mb-2">{user.email}</p>
              <span className="badge bg-primary mb-3">{getRoleLabel(user.role)}</span>

              <hr />

              <div className="text-start">
                <p><strong>Заклад:</strong> {user.institution || '—'}</p>
                <p><strong>Освіта:</strong> {getEducationLabel(user.education_level)}</p>
                <p><strong>Підписників:</strong> {user.followers_count || 0}</p>
                <p><strong>Підписок:</strong> {user.following_count || 0}</p>
                {user.is_verified && (
                  <span className="badge bg-success">Верифікований</span>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
            <Tab eventKey="profile" title="Редагувати профіль">
              <Card>
                <Card.Body>
                  {success && <Alert variant="success">{success}</Alert>}
                  {error && <Alert variant="danger">{error}</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Імʼя користувача</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Біографія</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Розкажіть про себе..."
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Наукові інтереси</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="scientific_interests"
                        value={formData.scientific_interests}
                        onChange={handleChange}
                        placeholder="Машинне навчання, аналіз даних..."
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Публікації</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="publications"
                        value={formData.publications}
                        onChange={handleChange}
                        placeholder="Список ваших наукових публікацій..."
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>ORCID</Form.Label>
                          <Form.Control
                            type="text"
                            name="orcid"
                            value={formData.orcid}
                            onChange={handleChange}
                            placeholder="0000-0000-0000-0000"
                          />
                          <Form.Text className="text-muted">
                            Ваш унікальний ідентифікатор науковця
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Google Scholar</Form.Label>
                          <Form.Control
                            type="url"
                            name="google_scholar"
                            value={formData.google_scholar}
                            onChange={handleChange}
                            placeholder="https://scholar.google.com/..."
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? 'Збереження...' : 'Зберегти зміни'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="ideas" title={`Мої ідеї (${myIdeas.length})`}>
              <Card>
                <Card.Body>
                  {myIdeas.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted">У вас ще немає ідей</p>
                      <Link to="/ideas/create" className="btn btn-primary">
                        Створити першу ідею
                      </Link>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {myIdeas.map((idea) => (
                        <Link
                          key={idea.id}
                          to={`/ideas/${idea.slug}`}
                          className="list-group-item list-group-item-action"
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{idea.title}</h6>
                              <small className="text-muted">
                                {idea.views_count} переглядів • {idea.likes_count} лайків
                              </small>
                            </div>
                            <span className={`badge bg-${
                              idea.status === 'completed' ? 'success' :
                              idea.status === 'in_progress' ? 'warning' : 'secondary'
                            }`}>
                              {idea.status === 'completed' ? 'Завершено' :
                               idea.status === 'in_progress' ? 'У процесі' : 'Ідея'}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;
