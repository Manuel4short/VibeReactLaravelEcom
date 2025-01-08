import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, Outlet, useNavigate } from 'react-router-dom';

function Header({ cartCount, cart }) { // Accept cart as a prop alongside cartCount
  let user = JSON.parse(localStorage.getItem('user-info'));
  const navigate = useNavigate();

  function logOut() {
    localStorage.clear();
    navigate('/');
  }

  return (
    <div className="login">
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">E-Commerce Store</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto Navbar_wrapper">
              {localStorage.getItem('user-info') ? (
                <>
                  <Link to="/">Product List</Link>
                  <Link to="/add">Add Product</Link>
                  <Link to="/update">Update Products</Link>
                  <Link to="/search">Search Products</Link>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </Nav>
            {localStorage.getItem('user-info') ? (
              <Nav className="ml-auto d-flex align-items-center">
                <span className="navbar-text mr-3">{user && user.name}</span>
                <Nav.Link onClick={logOut} className="btn btn-outline-danger">
                  Logout
                </Nav.Link>
              </Nav>
            ) : null}
            {/* Pass cart state to the Cart page */}
            <Nav className="ml-auto">
              <Link
                to="/cart"
                className="btn btn-primary"
                state={{ cart }} // Pass cart as state
              >
                Cart ({cartCount})
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Outlet />
    </div>
  );
}

export default Header;
