import { useEffect, useState } from 'react';
import type { Job } from '../types';
import { fetchJobs } from '../api';
import JobCard from '../components/JobCard';

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (location) params.location = location;
    if (type) params.type = type;
    if (skills) params.skills = skills;
    setLoading(true);
    fetchJobs(params)
      .then(setJobs)
      .catch(() => setError('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, [search, location, type, skills]);

  return (
    <section>
      <section className="hero-banner">
        <h1>Find work you love</h1>
        <p>Discover roles at innovative companies. Search, filter, and apply in minutes.</p>
      </section>
      <div className="search-bar">
        <input placeholder="Job title or keyword" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input placeholder="Skills (comma-separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="remote">Remote</option>
        </select>
      </div>
      <div className="container">
        {loading && <p style={{ color: 'var(--muted)' }}>Loading jobs…</p>}
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        {!loading && !error && (
          <>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{jobs.length} open positions</h2>
            {jobs.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>No jobs match your filters.</p>
            ) : (
              <div className="job-list">
                {jobs.map((job) => <JobCard key={job._id} job={job} />)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
