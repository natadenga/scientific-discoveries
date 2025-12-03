import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Alert } from 'react-bootstrap';
import { FaHeart, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { ideasAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import Loading from '../../components/common/Loading';
import useTitle from '../../hooks/useTitle';

function IdeaDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [idea, setIdea] = useState(null);
  useTitle(idea?.title || 'Завантаження...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const response = await ideasAPI.getBySlug(slug);
        setIdea(response.data);
      } catch {
        setError('Ідею не знайдено');
      }
      setLoading(false);
    };
    fetchIdea();
  }, [slug]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const response = await ideasAPI.like(slug);
      setIdea({ ...idea, likes_count: response.data.likes_count });
    } catch (err) {
      console.error('Error liking:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const response = await ideasAPI.addComment(slug, comment);
      setIdea({
        ...idea,
        comments: [...idea.comments, response.data],
      });
      setComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю ідею?')) return;

    try {
      await ideasAPI.delete(slug);
      navigate('/ideas');
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const getStatusBadge = (ideaStatus) => {
    const variants = {
      idea: 'primary',
      in_progress: 'warning',
      completed: 'success',
    };
    const labels = {
      idea: 'Ідея',
      in_progress: 'У процесі',
      completed: 'Завершено',
    };
    return <Badge bg={variants[ideaStatus]}>{labels[ideaStatus]}</Badge>;
  };

  if (loading) return <Loading />;
  if (error) return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!idea) return null;

  const isAuthor = user?.id === idea.author.id;

  return (
    <Container className="py-4">
      <Button
        variant="link"
        className="mb-3 p-0"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="me-2" />
        Назад
      </Button>

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  {getStatusBadge(idea.status)}
                  {idea.is_open_for_collaboration && (
                    <Badge bg="info" className="ms-2">Шукаю співпрацю</Badge>
                  )}
                </div>
                {isAuthor && (
                  <div>
                    <Button
                      as={Link}
                      to={`/ideas/${slug}/edit`}
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                    >
                      <FaEdit /> Редагувати
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleDelete}
                    >
                      <FaTrash /> Видалити
                    </Button>
                  </div>
                )}
              </div>

              <h1 className="mb-3">{idea.title}</h1>

              {idea.scientific_field && (
                <p className="text-muted">
                  <strong>Галузь:</strong> {idea.scientific_field.name}
                </p>
              )}

              {idea.keywords && (
                <p className="text-muted">
                  <strong>Ключові слова:</strong> {idea.keywords}
                </p>
              )}

              <hr />

              <div style={{ whiteSpace: 'pre-wrap' }}>{idea.description}</div>

              <hr />

              <div className="d-flex align-items-center justify-content-between">
                <Button
                  variant={idea.liked ? 'danger' : 'outline-danger'}
                  onClick={handleLike}
                >
                  <FaHeart className="me-2" />
                  {idea.likes_count}
                </Button>
                <small className="text-muted">
                  Переглядів: {idea.views_count}
                </small>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <strong>Коментарі ({idea.comments?.length || 0})</strong>
            </Card.Header>
            <Card.Body>
              {isAuthenticated ? (
                <Form onSubmit={handleComment} className="mb-4">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Напишіть коментар..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="mt-2"
                    disabled={submitting || !comment.trim()}
                  >
                    {submitting ? 'Відправка...' : 'Відправити'}
                  </Button>
                </Form>
              ) : (
                <Alert variant="info">
                  <Link to="/login">Увійдіть</Link>, щоб залишити коментар
                </Alert>
              )}

              {idea.comments?.length === 0 ? (
                <p className="text-muted text-center">Поки немає коментарів</p>
              ) : (
                idea.comments?.map((c) => (
                  <Card key={c.id} className="mb-2">
                    <Card.Body className="py-2">
                      <div className="d-flex justify-content-between">
                        <Link to={`/users/${c.author.id}`}>
                          <strong>{c.author.username}</strong>
                        </Link>
                        <small className="text-muted">
                          {new Date(c.created_at).toLocaleDateString('uk-UA')}
                        </small>
                      </div>
                      <p className="mb-0 mt-1">{c.content}</p>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>Автор</Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                  style={{ width: 50, height: 50 }}
                >
                  {idea.author.username[0].toUpperCase()}
                </div>
                <div>
                  <Link to={`/users/${idea.author.id}`}>
                    <strong>{idea.author.username}</strong>
                  </Link>
                  <br />
                  <small className="text-muted">{idea.author.role}</small>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>Інформація</Card.Header>
            <Card.Body>
              <p className="mb-1">
                <strong>Створено:</strong><br />
                {new Date(idea.created_at).toLocaleDateString('uk-UA')}
              </p>
              <p className="mb-0">
                <strong>Оновлено:</strong><br />
                {new Date(idea.updated_at).toLocaleDateString('uk-UA')}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default IdeaDetailPage;
