import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Job } from '../types';
import { fetchJob, applyToJob, getUser } from '../api';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [cover, setCover] = useState('');
  const [msg, setMsg] = useState('');
  const user = getUser();

  useEffect(() => {
    fetchJob(id!).then(setJob);
  }, [id]);

  async function handleApply() {
    try {
      await applyToJob(id!, cover);
      setMsg('Application submitted successfully!');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    }
  }

  if (!job) return <div className="detail-page">Loading…</div>;

  return (
    <article className="detail-page">
      <h1>{job.title}</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
        {job.company} · {job.location} · <span className="badge">{job.type}</span>
      </p>
      {(job.salaryMin || job.salaryMax) && (
        <p style={{ marginBottom: '1rem', fontWeight: 600 }}>
          ${job.salaryMin?.toLocaleString()} – ${job.salaryMax?.toLocaleString()}
        </p>
      )}
      {(job.skills?.length ?? 0) > 0 && (
        <p style={{ marginBottom: '1rem' }}>
          {job.skills!.map((s) => <span key={s} className="badge" style={{ marginRight: '0.35rem' }}>{s}</span>)}
        </p>
      )}
      <p style={{ lineHeight: 1.7, marginBottom: '1.5rem' }}>{job.description}</p>
      {(job.requirements?.length ?? 0) > 0 && (
        <>
          <h3 style={{ marginBottom: '0.5rem' }}>Requirements</h3>
          <ul style={{ marginLeft: '1.25rem', marginBottom: '1.5rem', lineHeight: 1.8 }}>
            {job.requirements!.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </>
      )}
      {user?.role === 'applicant' && (
        <div className="form-card" style={{ marginTop: '1rem' }}>
          <h3>Apply for this role</h3>
          <textarea rows={4} placeholder="Cover letter (optional)" value={cover} onChange={(e) => setCover(e.target.value)} />
          <button className="btn-primary" onClick={handleApply}>Submit Application</button>
          {msg && <p style={{ color: msg.includes('success') ? 'var(--success)' : '#dc2626' }}>{msg}</p>}
        </div>
      )}
      {!user && <p style={{ marginTop: '1rem' }}><a href="/login">Sign in</a> to apply.</p>}
    </article>
  );
}
