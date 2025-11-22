import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, Outlet, useNavigate } from "react-router-dom";

function Header({ cartCount, cart }) {
  let user = JSON.parse(localStorage.getItem("user-info"));
  const navigate = useNavigate();

  function logOut() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <div className="login">
      <Navbar bg="light" expand="lg">
        <Container fluid>
          {/* Website Name */}
          <Navbar.Brand href="/">Prime Store</Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            {/* Single Nav Container for Proper Spacing */}
            <Nav className="w-100 d-flex justify-content-between align-items-center">
              {/* Left-side Links */}
              <div className="d-flex align-items-center  ms-5 ps-5">
                <Nav.Link as={Link} to="/" className="me-3">
                  Product List
                </Nav.Link>

                {/* Admin Links */}
                {user && user.role && user.role.toLowerCase() === "admin" && (
                  <>
                    <Nav.Link as={Link} to="/add" className="me-3">
                      Add Product
                    </Nav.Link>
                    <Nav.Link as={Link} to="/update" className="me-3">
                      Update Products
                    </Nav.Link>
                  </>
                )}

                <Nav.Link as={Link} to="/search" className="me-3">
                  Search Products
                </Nav.Link>
              </div>

              {/* Right-side: User & Cart */}
              <div className="d-flex align-items-center">
                {user ? (
                  <>
                    <span className="navbar-text me-3">
                      Welcome, {user.name}
                    </span>
                    <Nav.Link
                      onClick={logOut}
                      className="btn btn-outline-danger me-3"
                    >
                      Logout
                    </Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login" className="me-3">
                      Login
                    </Nav.Link>
                    <Nav.Link as={Link} to="/register" className="me-3">
                      Register
                    </Nav.Link>
                  </>
                )}

                {/* Cart Button */}
                <Nav.Link
                  as={Link}
                  to="/cart"
                  className="btn btn-success cart-btn"
                >
                  <i className="bi bi-cart me-1"></i>
                  Cart (<span className="cart-count">{cartCount}</span>)
                </Nav.Link>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default Header;
