import type { UserRole } from '../types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState<UserRole>('applicant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (tab === 'login') {
        const { user } = await login(email, password);
        navigate(user.role === 'employer' ? '/dashboard' : '/');
      } else {
        const { user } = await register({ email, password, name, role, company: role === 'employer' ? company : undefined });
        navigate(user.role === 'employer' ? '/dashboard' : '/');
      }
    } catch {
      setError('Authentication failed');
    }
  }

  return (
    <div className="login-wrap">
      <div className="form-card" style={{ width: '100%', maxWidth: 420 }}>
        <h1 style={{ fontFamily: 'Source Serif 4, serif', color: 'var(--primary)' }}>TalentNest</h1>
        <div className="tabs">
          <button type="button" className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>Sign in</button>
          <button type="button" className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')}>Register</button>
        </div>
        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <>
              <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                <option value="applicant">Job Seeker</option>
                <option value="employer">Employer</option>
              </select>
              <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
              {role === 'employer' && (
                <input placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} required />
              )}
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p style={{ color: '#dc2626' }}>{error}</p>}
          <button type="submit" className="btn-primary">{tab === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
          Demo: hr@talentnest.demo / employer123 · jane@talentnest.demo / applicant123
        </p>
      </div>
    </div>
  );
}
