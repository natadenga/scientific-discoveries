import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';
import { usersAPI } from '../../api';
import Loading from '../../components/common/Loading';
import useTitle from '../../hooks/useTitle';

function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useTitle(user?.username || 'Завантаження...');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await usersAPI.getById(id);
        setUser(response.data);

        // Завантажити ідеї користувача
        const ideasResponse = await usersAPI.getIdeas(id);
        setIdeas(ideasResponse.data.results || ideasResponse.data);
      } catch {
        setError('Користувача не знайдено');
      }
      setLoading(false);
    };
    fetchUser();
  }, [id]);

  const getRoleBadge = (role) => {
    const variants = {
      student: 'info',
      teacher: 'primary',
    };
    const labels = {
      student: 'Студент',
      teacher: 'Викладач',
    };
    return <Badge bg={variants[role]}>{labels[role]}</Badge>;
  };

  if (loading) return <Loading />;
  if (error) return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!user) return null;

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
                {user.username}
                {user.is_verified && (
                  <FaCheckCircle className="text-primary ms-2" title="Верифікований" />
                )}
              </h4>
              {getRoleBadge(user.role)}

              {user.institution && (
                <p className="text-muted mt-2 mb-0">{user.institution}</p>
              )}

              <div className="d-flex justify-content-center gap-4 mt-3">
                <div>
                  <strong>{user.followers_count || 0}</strong>
                  <div className="text-muted small">підписників</div>
                </div>
                <div>
                  <strong>{user.following_count || 0}</strong>
                  <div className="text-muted small">підписок</div>
                </div>
              </div>
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
    </Container>
  );
}

export default UserDetailPage;
