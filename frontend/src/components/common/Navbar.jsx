import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FaFlask, FaUser, FaSignOutAlt } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';

function AppNavbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentType = searchParams.get('type');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FaFlask className="me-2" />
          Наукові Знахідки
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/contents?type=idea">Ідеї</Nav.Link>
            <Nav.Link as={Link} to="/contents?type=resource">Ресурси</Nav.Link>
            <Nav.Link as={Link} to="/contents?type=webinar">Вебінари</Nav.Link>
            <Nav.Link as={Link} to="/contents?type=lecture">Лекції</Nav.Link>
            <Nav.Link as={Link} to="/users">Науковці</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to={currentType ? `/contents/create?type=${currentType}` : '/contents/create'}>
                  + Додати
                </Nav.Link>
                <Nav.Link as={Link} to="/profile">
                  <FaUser className="me-1" />
                  {user?.full_name || user?.username}
                </Nav.Link>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  <FaSignOutAlt className="me-1" />
                  Вийти
                </Button>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Nav.Link as={Link} to="/login">Увійти</Nav.Link>
                <Button as={Link} to="/register" variant="outline-light" size="sm">
                  Реєстрація
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
