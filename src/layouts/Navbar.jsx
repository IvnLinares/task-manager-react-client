import React, { useContext } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { Sun, Moon, LogOut, LayoutDashboard, CalendarDays, Tag } from 'lucide-react';

const NavigationBar = () => {
  const { token, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="app-navbar">
      <Container>
        {/* Brand */}
        <Navbar.Brand as={Link} to="/" className="navbar-brand-custom">
          <span className="navbar-logo-dot" />
          Task Manager
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" className="navbar-toggler-custom" />

        <Navbar.Collapse id="main-navbar">
          {/* Left nav links */}
          <Nav className="me-auto">
            {token && (
              <>
                <Nav.Link as={Link} to="/dashboard" className="navbar-link">
                  <LayoutDashboard size={15} className="me-1" style={{ verticalAlign: 'middle' }} />
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/calendar" className="navbar-link">
                  <CalendarDays size={15} className="me-1" style={{ verticalAlign: 'middle' }} />
                  Calendar
                </Nav.Link>
                <Nav.Link as={Link} to="/categories" className="navbar-link">
                  <Tag size={15} className="me-1" style={{ verticalAlign: 'middle' }} />
                  Categories
                </Nav.Link>
              </>
            )}
          </Nav>

          {/* Right controls */}
          <Nav className="align-items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="navbar-icon-btn"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {!token ? (
              <>
                <Nav.Link as={Link} to="/login" className="navbar-link">Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className="navbar-cta">Register</Nav.Link>
              </>
            ) : (
              <button onClick={handleLogout} className="navbar-logout-btn">
                <LogOut size={15} className="me-1" />
                Logout
              </button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
