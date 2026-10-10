/**
 * AppLayout Component
 * Main application layout with navigation
 */

import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export const AppLayout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const layoutStyles = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyles = {
    backgroundColor: 'white',
    borderBottom: '1px solid var(--color-gray-200)',
    padding: '0 var(--spacing-6)',
    height: '4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: 'var(--shadow-sm)',
  };

  const logoStyles = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--color-primary-600)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  };

  const navStyles = {
    display: 'flex',
    gap: 'var(--spacing-4)',
    alignItems: 'center',
  };

  const navLinkStyles = (isActive) => ({
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: isActive ? 'var(--color-primary-700)' : 'var(--color-gray-700)',
    backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  });

  const userMenuStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-4)',
    borderLeft: '1px solid var(--color-gray-200)',
    paddingLeft: 'var(--spacing-4)',
  };

  const userInfoStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  };

  const userNameStyles = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--color-gray-900)',
  };

  const userRoleStyles = {
    fontSize: '0.75rem',
    color: 'var(--color-gray-500)',
  };

  const logoutButtonStyles = {
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'white',
    backgroundColor: 'var(--color-error-500)',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  };

  const mainStyles = {
    flex: 1,
    padding: 'var(--spacing-6)',
    backgroundColor: 'var(--color-gray-50)',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <div style={layoutStyles}>
      <header style={headerStyles}>
        <div style={logoStyles}>
          <span style={{ fontSize: '1.5rem' }}>🎫</span>
          <span>SupportHub</span>
        </div>

        {user && (
          <>
            <nav style={navStyles}>
              {isAdmin ? (
                <>
                  <a
                    onClick={() => navigate('/admin/dashboard')}
                    style={navLinkStyles(isActivePath('/admin/dashboard'))}
                    onMouseEnter={(e) => {
                      if (!isActivePath('/admin/dashboard')) {
                        e.target.style.backgroundColor = 'var(--color-gray-100)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActivePath('/admin/dashboard')) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    Dashboard
                  </a>
                  <a
                    onClick={() => navigate('/admin/tickets')}
                    style={navLinkStyles(isActivePath('/admin/tickets'))}
                    onMouseEnter={(e) => {
                      if (!isActivePath('/admin/tickets')) {
                        e.target.style.backgroundColor = 'var(--color-gray-100)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActivePath('/admin/tickets')) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    All Tickets
                  </a>
                </>
              ) : (
                <>
                  <a
                    onClick={() => navigate('/dashboard')}
                    style={navLinkStyles(isActivePath('/dashboard'))}
                    onMouseEnter={(e) => {
                      if (!isActivePath('/dashboard')) {
                        e.target.style.backgroundColor = 'var(--color-gray-100)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActivePath('/dashboard')) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    Dashboard
                  </a>
                  <a
                    onClick={() => navigate('/tickets')}
                    style={navLinkStyles(isActivePath('/tickets'))}
                    onMouseEnter={(e) => {
                      if (!isActivePath('/tickets')) {
                        e.target.style.backgroundColor = 'var(--color-gray-100)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActivePath('/tickets')) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    My Tickets
                  </a>
                </>
              )}
            </nav>

            <div style={userMenuStyles}>
              <div style={userInfoStyles}>
                <div style={userNameStyles}>{user.name}</div>
                <div style={userRoleStyles}>{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                style={logoutButtonStyles}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--color-error-700)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--color-error-500)';
                }}
              >
                Logout
              </button>
            </div>
          </>
        )}
      </header>

      <main style={mainStyles}>{children}</main>
    </div>
  );
};
