import { Link, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../api';

export default function Header() {
  const user = getUser();
  const navigate = useNavigate();

  return (
    <header className="header">
      <Link to="/" className="brand">Talent<span>Nest</span></Link>
      <nav className="nav">
        <Link to="/">Jobs</Link>
        {user && (
          <>
            <Link to={user.role === 'employer' ? '/dashboard' : '/applications'}>
              {user.role === 'employer' ? 'Employer Dashboard' : 'My Applications'}
            </Link>
          </>
        )}
        {user ? (
          <>
            <span style={{ color: 'var(--muted)' }}>{user.name}</span>
            <button className="btn-outline" onClick={() => { logout(); navigate('/login'); }}>Sign out</button>
          </>
        ) : (
          <Link to="/login"><button className="btn-primary">Sign in</button></Link>
        )}
      </nav>
    </header>
  );
}
