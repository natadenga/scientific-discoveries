import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Alert } from 'react-bootstrap';
import { FaHeart, FaEdit, FaTrash, FaArrowLeft, FaReply, FaExternalLinkAlt } from 'react-icons/fa';
import { contentsAPI } from '../../api';
import useAuthStore from '../../store/authStore';
import Loading from '../../components/common/Loading';
import useTitle from '../../hooks/useTitle';

const getContentTypeLabel = (type) => {
  const labels = {
    idea: 'Ідея',
    resource: 'Ресурс',
    webinar: 'Вебінар',
    lecture: 'Лекція',
  };
  return labels[type] || type;
};

const getContentTypeVariant = (type) => {
  const variants = {
    idea: 'primary',
    resource: 'success',
    webinar: 'info',
    lecture: 'warning',
  };
  return variants[type] || 'secondary';
};

function ContentDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [content, setContent] = useState(null);
  useTitle(content?.title || 'Завантаження...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await contentsAPI.getBySlug(slug);
        setContent(response.data);
      } catch {
        setError('Контент не знайдено');
      }
      setLoading(false);
    };
    fetchContent();
  }, [slug]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const response = await contentsAPI.like(slug);
      setContent({ ...content, likes_count: response.data.likes_count });
    } catch (err) {
      console.error('Error liking:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const response = await contentsAPI.addComment(slug, comment);
      setContent({
        ...content,
        comments: [...content.comments, response.data],
      });
      setComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
    setSubmitting(false);
  };

  const handleReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await contentsAPI.addComment(slug, replyContent, parentId);
      // Додаємо відповідь до відповідного коментаря
      setContent({
        ...content,
        comments: content.comments.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), response.data] }
            : c
        ),
      });
      setReplyContent('');
      setReplyTo(null);
    } catch (err) {
      console.error('Error adding reply:', err);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей контент?')) return;

    try {
      await contentsAPI.delete(slug);
      navigate('/contents');
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const getStatusBadge = (contentStatus) => {
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
    return <Badge bg={variants[contentStatus]}>{labels[contentStatus]}</Badge>;
  };

  if (loading) return <Loading />;
  if (error) return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!content) return null;

  const isAuthor = user?.id === content.author.id;

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
                  <Badge bg={getContentTypeVariant(content.content_type)} className="me-2">
                    {getContentTypeLabel(content.content_type)}
                  </Badge>
                  {getStatusBadge(content.status)}
                  {content.is_open_for_collaboration && (
                    <Badge bg="info" className="ms-2">Шукаю співпрацю</Badge>
                  )}
                </div>
                {isAuthor && (
                  <div>
                    <Button
                      as={Link}
                      to={`/contents/${slug}/edit`}
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

              <h1 className="mb-3">{content.title}</h1>

              {content.link && (
                <p>
                  <a
                    href={content.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    <FaExternalLinkAlt className="me-2" />
                    Відкрити посилання
                  </a>
                </p>
              )}

              {content.scientific_fields && content.scientific_fields.length > 0 && (
                <p className="text-muted">
                  <strong>Галузі:</strong> {content.scientific_fields.map((f) => f.name).join(', ')}
                </p>
              )}

              {content.keywords && (
                <p className="text-muted">
                  <strong>Ключові слова:</strong> {content.keywords}
                </p>
              )}

              <hr />

              <div style={{ whiteSpace: 'pre-wrap' }}>{content.description}</div>

              <hr />

              <div className="d-flex align-items-center justify-content-between">
                <Button
                  variant={content.liked ? 'danger' : 'outline-danger'}
                  onClick={handleLike}
                >
                  <FaHeart className="me-2" />
                  {content.likes_count}
                </Button>
                <small className="text-muted">
                  Переглядів: {content.views_count}
                </small>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <strong>Коментарі ({content.comments?.length || 0})</strong>
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

              {content.comments?.length === 0 ? (
                <p className="text-muted text-center">Поки немає коментарів</p>
              ) : (
                content.comments?.map((c) => (
                  <Card key={c.id} className="mb-3">
                    <Card.Body className="py-2">
                      <div className="d-flex justify-content-between">
                        <Link to={`/users/${c.author.id}`}>
                          <strong>{c.author.full_name || c.author.username}</strong>
                        </Link>
                        <small className="text-muted">
                          {new Date(c.created_at).toLocaleDateString('uk-UA')}
                        </small>
                      </div>
                      <p className="mb-1 mt-1">{c.text}</p>
                      {isAuthenticated && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-muted"
                          onClick={() => {
                            setReplyTo(replyTo === c.id ? null : c.id);
                            setReplyContent('');
                          }}
                        >
                          <FaReply className="me-1" />
                          Відповісти
                        </Button>
                      )}

                      {/* Форма відповіді */}
                      {replyTo === c.id && (
                        <Form onSubmit={(e) => handleReply(e, c.id)} className="mt-2">
                          <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="Напишіть відповідь..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                          />
                          <div className="mt-2">
                            <Button
                              type="submit"
                              variant="primary"
                              size="sm"
                              disabled={submitting || !replyContent.trim()}
                            >
                              {submitting ? 'Відправка...' : 'Відповісти'}
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => setReplyTo(null)}
                            >
                              Скасувати
                            </Button>
                          </div>
                        </Form>
                      )}

                      {/* Відповіді */}
                      {c.replies && c.replies.length > 0 && (
                        <div className="ms-4 mt-2 border-start ps-3">
                          {c.replies.map((reply) => (
                            <div key={reply.id} className="mb-2">
                              <div className="d-flex justify-content-between">
                                <Link to={`/users/${reply.author.id}`}>
                                  <strong>{reply.author.full_name || reply.author.username}</strong>
                                </Link>
                                <small className="text-muted">
                                  {new Date(reply.created_at).toLocaleDateString('uk-UA')}
                                </small>
                              </div>
                              <p className="mb-0 mt-1">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
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
                  {content.author.username[0].toUpperCase()}
                </div>
                <div>
                  <Link to={`/users/${content.author.id}`}>
                    <strong>{content.author.full_name || content.author.username}</strong>
                  </Link>
                  <br />
                  <small className="text-muted">@{content.author.username}</small>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>Інформація</Card.Header>
            <Card.Body>
              <p className="mb-1">
                <strong>Створено:</strong><br />
                {new Date(content.created_at).toLocaleDateString('uk-UA')}
              </p>
              <p className="mb-0">
                <strong>Оновлено:</strong><br />
                {new Date(content.updated_at).toLocaleDateString('uk-UA')}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ContentDetailPage;
