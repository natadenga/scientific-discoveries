import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Tab, Tabs, Modal, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { usersAPI, institutionsAPI } from '../../api/users';
import { contentsAPI } from '../../api/contents';
import useTitle from '../../hooks/useTitle';

function ProfilePage() {
  useTitle('Мій профіль');
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    bio: '',
    institution: '',
    education_level: '',
    role: '',
    scientific_interests: '',
    publications: '',
    orcid: '',
    google_scholar: '',
    web_of_science: '',
    scopus: '',
  });
  const [myContents, setMyContents] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Для автокомпліту закладів освіти
  const [institutions, setInstitutions] = useState([]);
  const [showInstitutions, setShowInstitutions] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        institution: user.institution || '',
        education_level: user.education_level || '',
        role: user.role || '',
        scientific_interests: user.scientific_interests || '',
        publications: user.publications || '',
        orcid: user.orcid || '',
        google_scholar: user.google_scholar || '',
        web_of_science: user.web_of_science || '',
        scopus: user.scopus || '',
      });
    }
  }, [user]);

  // Завантаження закладів освіти
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

  useEffect(() => {
    const fetchMyContents = async () => {
      try {
        const response = await contentsAPI.getMy();
        setMyContents(response.data.results || response.data);
      } catch (err) {
        console.error('Error fetching contents:', err);
      }
    };
    fetchMyContents();
  }, []);

  useEffect(() => {
    const fetchFollowData = async () => {
      if (!user?.id) return;
      try {
        const [followersRes, followingRes] = await Promise.all([
          usersAPI.getFollowers(user.id),
          usersAPI.getFollowing(user.id),
        ]);
        setFollowers(followersRes.data.results || followersRes.data);
        setFollowing(followingRes.data.results || followingRes.data);
      } catch (err) {
        console.error('Error fetching follow data:', err);
      }
    };
    fetchFollowData();
  }, [user?.id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInstitutionSelect = (name) => {
    setFormData({ ...formData, institution: name });
    setShowInstitutions(false);
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
      junior_bachelor: 'Фаховий молодший бакалавр',
      bachelor: 'Бакалавр',
      master: 'Магістр',
      phd: 'Аспірант',
      candidate: 'Кандидат наук',
      doctor_phd: 'Доктор філософії (PhD)',
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
              <h4>{user.full_name || user.username}</h4>
              <p className="text-muted mb-1">@{user.username}</p>
              <p className="text-muted mb-2">{user.email}</p>
              <span className="badge bg-primary mb-3">{getRoleLabel(user.role)}</span>

              <hr />

              <div className="text-start">
                <p><strong>Заклад:</strong> {user.institution || '—'}</p>
                <p><strong>Освіта:</strong> {getEducationLabel(user.education_level)}</p>
                <p
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowFollowersModal(true)}
                  className="mb-2"
                >
                  <strong>Підписників:</strong>{' '}
                  <span className="text-primary">{followers.length}</span>
                </p>
                <p
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowFollowingModal(true)}
                  className="mb-2"
                >
                  <strong>Підписок:</strong>{' '}
                  <span className="text-primary">{following.length}</span>
                </p>
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
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Імʼя</Form.Label>
                          <Form.Control
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="Ваше імʼя"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Прізвище</Form.Label>
                          <Form.Control
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Ваше прізвище"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Імʼя користувача</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Роль</Form.Label>
                          <Form.Select name="role" value={formData.role} onChange={handleChange}>
                            <option value="student">Студент</option>
                            <option value="teacher">Викладач</option>
                            <option value="researcher">Дослідник</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
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
                      </Col>
                    </Row>

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
                      <Form.Label>Публікації (посилання)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="publications"
                        value={formData.publications}
                        onChange={handleChange}
                        placeholder="Посилання на ваші наукові публікації (кожне з нового рядка)"
                      />
                      <Form.Text className="text-muted">
                        Вводіть кожне посилання з нового рядка
                      </Form.Text>
                    </Form.Group>

                    <h6 className="mb-3 mt-4">Наукові профілі</h6>

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

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Web of Science</Form.Label>
                          <Form.Control
                            type="url"
                            name="web_of_science"
                            value={formData.web_of_science}
                            onChange={handleChange}
                            placeholder="https://www.webofscience.com/..."
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Scopus</Form.Label>
                          <Form.Control
                            type="url"
                            name="scopus"
                            value={formData.scopus}
                            onChange={handleChange}
                            placeholder="https://www.scopus.com/..."
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

            <Tab eventKey="contents" title={`Мій контент (${myContents.length})`}>
              <Card>
                <Card.Body>
                  {myContents.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted">У вас ще немає контенту</p>
                      <Link to="/contents/create" className="btn btn-primary">
                        Створити
                      </Link>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {myContents.map((content) => (
                        <Link
                          key={content.id}
                          to={`/contents/${content.slug}`}
                          className="list-group-item list-group-item-action"
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{content.title}</h6>
                              <small className="text-muted">
                                {content.views_count} переглядів • {content.likes_count} лайків
                              </small>
                            </div>
                            <span className={`badge bg-${
                              content.status === 'completed' ? 'success' :
                              content.status === 'in_progress' ? 'warning' : 'secondary'
                            }`}>
                              {content.status === 'completed' ? 'Завершено' :
                               content.status === 'in_progress' ? 'У процесі' : 'Ідея'}
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

      {/* Модальне вікно підписників */}
      <Modal show={showFollowersModal} onHide={() => setShowFollowersModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Мої підписники</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {followers.length === 0 ? (
            <p className="text-muted text-center">Поки немає підписників</p>
          ) : (
            <ListGroup variant="flush">
              {followers.map((follower) => (
                <ListGroup.Item key={follower.id} className="d-flex align-items-center">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                    style={{ width: 40, height: 40 }}
                  >
                    {follower.username[0].toUpperCase()}
                  </div>
                  <Link
                    to={`/users/${follower.id}`}
                    onClick={() => setShowFollowersModal(false)}
                  >
                    {follower.full_name || follower.username}
                  </Link>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>

      {/* Модальне вікно підписок */}
      <Modal show={showFollowingModal} onHide={() => setShowFollowingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Мої підписки</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {following.length === 0 ? (
            <p className="text-muted text-center">Поки немає підписок</p>
          ) : (
            <ListGroup variant="flush">
              {following.map((u) => (
                <ListGroup.Item key={u.id} className="d-flex align-items-center">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                    style={{ width: 40, height: 40 }}
                  >
                    {u.username[0].toUpperCase()}
                  </div>
                  <Link
                    to={`/users/${u.id}`}
                    onClick={() => setShowFollowingModal(false)}
                  >
                    {u.full_name || u.username}
                  </Link>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ProfilePage;
