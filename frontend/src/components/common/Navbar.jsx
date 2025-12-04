import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { FaFlask, FaUser, FaSignOutAlt } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';

function AppNavbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

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
            <NavDropdown title="Контент" id="content-dropdown">
              <NavDropdown.Item as={Link} to="/contents">Весь контент</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/contents?type=idea">Ідеї</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/contents?type=resource">Ресурси</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/contents?type=webinar">Вебінари</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/contents?type=lecture">Лекції</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/users">Науковці</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/contents/create">
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
