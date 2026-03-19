import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import type { Application } from '../types';
import { getUser, fetchMyApplications } from '../api';

export default function Applications() {
  const user = getUser();
  const [apps, setApps] = useState<Application[]>([]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'employer') return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    fetchMyApplications().then(setApps);
  }, []);

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ fontFamily: 'Source Serif 4, serif', marginBottom: '1.5rem' }}>My Applications</h1>
      <div className="job-list">
        {apps.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No applications yet. <Link to="/">Browse jobs</Link></p>
        ) : apps.map((a) => (
          <div key={a._id} className="job-card" style={{ cursor: 'default' }}>
            <Link to={`/jobs/${a.job?._id}`}><h3>{a.job?.title}</h3></Link>
            <div className="meta">{a.job?.company} · Applied {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</div>
            <span className={`badge status-${a.status}`} style={{ marginTop: '0.5rem' }}>{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
