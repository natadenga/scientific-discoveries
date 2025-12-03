import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Alert, Button, Modal, ListGroup } from 'react-bootstrap';
import { FaCheckCircle, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { usersAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import Loading from '../../components/common/Loading';
import useTitle from '../../hooks/useTitle';

function UserDetailPage() {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuthStore();

  const [user, setUser] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  useTitle(user?.username || 'Завантаження...');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const [userResponse, ideasResponse, followersResponse, followingResponse] = await Promise.all([
          usersAPI.getById(id),
          usersAPI.getIdeas(id),
          usersAPI.getFollowers(id),
          usersAPI.getFollowing(id),
        ]);

        setUser(userResponse.data);
        setIdeas(ideasResponse.data.results || ideasResponse.data);
        setFollowers(followersResponse.data.results || followersResponse.data);
        setFollowing(followingResponse.data.results || followingResponse.data);

        // Перевіряємо чи поточний користувач підписаний
        if (currentUser) {
          const followerIds = (followersResponse.data.results || followersResponse.data).map(f => f.id);
          setIsFollowing(followerIds.includes(currentUser.id));
        }
      } catch {
        setError('Користувача не знайдено');
      }
      setLoading(false);
    };
    fetchUser();
  }, [id, currentUser]);

  const handleFollow = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await usersAPI.follow(id);
      if (response.data.status === 'followed') {
        setIsFollowing(true);
        setFollowers([...followers, currentUser]);
      } else {
        setIsFollowing(false);
        setFollowers(followers.filter(f => f.id !== currentUser.id));
      }
    } catch (err) {
      console.error('Error following:', err);
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      student: 'info',
      teacher: 'primary',
      researcher: 'success',
    };
    const labels = {
      student: 'Студент',
      teacher: 'Викладач',
      researcher: 'Дослідник',
    };
    return <Badge bg={variants[role] || 'secondary'}>{labels[role] || role}</Badge>;
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

  if (loading) return <Loading />;
  if (error) return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!user) return null;

  const isOwnProfile = currentUser?.id === parseInt(id);

  return (
    <Container className="py-4">
      <Row>
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: 100, height: 100, fontSize: '2.5rem' }}
              >
                {user.username[0].toUpperCase()}
              </div>
              <h4>
                {user.full_name || user.username}
                {user.is_verified && (
                  <FaCheckCircle className="text-primary ms-2" title="Верифікований" />
                )}
              </h4>
              <p className="text-muted mb-1">@{user.username}</p>
              {getRoleBadge(user.role)}

              {user.institution && (
                <p className="text-muted mt-2 mb-0">{user.institution}</p>
              )}

              <div className="d-flex justify-content-center gap-4 mt-3">
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowFollowersModal(true)}
                >
                  <strong>{followers.length}</strong>
                  <div className="text-muted small">підписників</div>
                </div>
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowFollowingModal(true)}
                >
                  <strong>{following.length}</strong>
                  <div className="text-muted small">підписок</div>
                </div>
              </div>

              {isAuthenticated && !isOwnProfile && (
                <Button
                  variant={isFollowing ? 'outline-secondary' : 'primary'}
                  className="mt-3"
                  onClick={handleFollow}
                >
                  {isFollowing ? (
                    <><FaUserMinus className="me-2" />Відписатися</>
                  ) : (
                    <><FaUserPlus className="me-2" />Підписатися</>
                  )}
                </Button>
              )}
            </Card.Body>
          </Card>

          {user.bio && (
            <Card className="mb-4">
              <Card.Header>Про себе</Card.Header>
              <Card.Body>
                <p className="mb-0">{user.bio}</p>
              </Card.Body>
            </Card>
          )}

          {user.scientific_interests && (
            <Card className="mb-4">
              <Card.Header>Наукові інтереси</Card.Header>
              <Card.Body>
                <p className="mb-0">{user.scientific_interests}</p>
              </Card.Body>
            </Card>
          )}

          {user.publications && (
            <Card className="mb-4">
              <Card.Header>Публікації</Card.Header>
              <Card.Body>
                <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{user.publications}</p>
              </Card.Body>
            </Card>
          )}

          {/* Додаткова інформація */}
          <Card className="mb-4">
            <Card.Header>Інформація</Card.Header>
            <Card.Body>
              {user.education_level && (
                <p className="mb-2">
                  <strong>Освіта:</strong> {getEducationLabel(user.education_level)}
                </p>
              )}
              {user.orcid && (
                <p className="mb-2">
                  <strong>ORCID:</strong>{' '}
                  <a href={`https://orcid.org/${user.orcid}`} target="_blank" rel="noopener noreferrer">
                    {user.orcid}
                  </a>
                </p>
              )}
              {user.google_scholar && (
                <p className="mb-0">
                  <strong>Google Scholar:</strong>{' '}
                  <a href={user.google_scholar} target="_blank" rel="noopener noreferrer">
                    Профіль
                  </a>
                </p>
              )}
              {!user.education_level && !user.orcid && !user.google_scholar && (
                <p className="text-muted mb-0">Додаткова інформація не вказана</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <h5 className="mb-3">Ідеї користувача</h5>
          {ideas.length === 0 ? (
            <Card>
              <Card.Body className="text-center text-muted">
                Користувач ще не опублікував ідей
              </Card.Body>
            </Card>
          ) : (
            ideas.map((idea) => (
              <Card key={idea.id} className="mb-3">
                <Card.Body>
                  <Card.Title>
                    <Link to={`/ideas/${idea.slug}`} className="text-decoration-none">
                      {idea.title}
                    </Link>
                  </Card.Title>
                  {idea.scientific_field && (
                    <small className="text-muted">{idea.scientific_field.name}</small>
                  )}
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
      </Row>

      {/* Модальне вікно підписників */}
      <Modal show={showFollowersModal} onHide={() => setShowFollowersModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Підписники</Modal.Title>
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
          <Modal.Title>Підписки</Modal.Title>
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

export default UserDetailPage;
