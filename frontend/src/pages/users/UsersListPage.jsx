import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch, FaCheckCircle } from 'react-icons/fa';
import { usersAPI } from '../../api';
import Loading from '../../components/common/Loading';
import useTitle from '../../hooks/useTitle';

function UsersListPage() {
  useTitle('Науковці');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;

        const response = await usersAPI.getList(params);
        setUsers(response.data.results || response.data);
      } catch (err) {
        console.error('Error loading users:', err);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
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
    return <Badge bg={variants[role]}>{labels[role]}</Badge>;
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Науковці</h1>

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={6}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Пошук за іменем..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button type="submit" variant="outline-primary">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <Loading />
      ) : users.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <p className="text-muted mb-0">Користувачів не знайдено</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {users.map((user) => (
            <Col key={user.id} md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                      style={{ width: 50, height: 50, fontSize: '1.2rem' }}
                    >
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <h5 className="mb-0">
                        <Link to={`/users/${user.id}`} className="text-decoration-none">
                          {user.full_name || user.username}
                        </Link>
                        {user.is_verified && (
                          <FaCheckCircle className="text-primary ms-2" title="Верифікований" />
                        )}
                      </h5>
                      <small className="text-muted">@{user.username}</small>{' '}
                      {getRoleBadge(user.role)}
                    </div>
                  </div>

                  {user.institution && (
                    <p className="text-muted small mb-2">{user.institution}</p>
                  )}

                  <div className="d-flex text-muted small">
                    <span className="me-3">
                      <strong>{user.followers_count}</strong> підписників
                    </span>
                    <span>
                      <strong>{user.following_count}</strong> підписок
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default UsersListPage;
