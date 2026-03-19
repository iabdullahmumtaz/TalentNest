import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { Application, Job, Stats, User, UserRole } from '../types';
import {
  getUser, fetchEmployerJobs, fetchStats, fetchJobApplicants,
  updateApplicationStatus, createJob, updateJob, deleteJob,
} from '../api';

const STATUSES = ['applied', 'reviewing', 'interview', 'offered', 'rejected'];

export default function Dashboard() {
  const user = getUser() as User | null;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: '', company: user?.company || '', location: '', type: 'full-time',
    description: '', salaryMin: '', salaryMax: '', skills: '',
  });

  if (!user || user.role !== 'employer') return <Navigate to="/login" replace />;

  const loadJobs = () => fetchEmployerJobs().then(setJobs);
  const loadStats = () => fetchStats().then(setStats);

  useEffect(() => {
    loadJobs();
    loadStats();
  }, []);

  async function loadApplicants(jobId: string) {
    setSelectedJob(jobId);
    const apps = await fetchJobApplicants(jobId);
    setApplicants(apps);
  }

  async function handleStatus(appId: string, status: string) {
    await updateApplicationStatus(appId, status, notes[appId] || '');
    if (selectedJob) loadApplicants(selectedJob);
    loadStats();
  }

  function resetForm() {
    setForm({
      title: '', company: user?.company || '', location: '', type: 'full-time',
      description: '', salaryMin: '', salaryMax: '', skills: '',
    });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmitJob(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      salaryMin: form.salaryMin ? +form.salaryMin : undefined,
      salaryMax: form.salaryMax ? +form.salaryMax : undefined,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      requirements: form.description.split('\n').filter(Boolean).slice(0, 3),
    };
    if (editingId) {
      const job = await updateJob(editingId, payload);
      setJobs(jobs.map((j) => (j._id === editingId ? job : j)));
    } else {
      const job = await createJob(payload);
      setJobs([job, ...jobs]);
    }
    resetForm();
    loadStats();
  }

  function startEdit(job: Job) {
    setEditingId(job._id);
    setForm({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type || 'full-time',
      description: job.description,
      salaryMin: job.salaryMin != null ? String(job.salaryMin) : '',
      salaryMax: job.salaryMax != null ? String(job.salaryMax) : '',
      skills: (job.skills || []).join(', '),
    });
    setShowForm(true);
  }

  async function handleDeactivate(jobId: string) {
    if (!confirm('Deactivate this job listing?')) return;
    await deleteJob(jobId);
    setJobs(jobs.filter((j) => j._id !== jobId));
    if (selectedJob === jobId) {
      setSelectedJob(null);
      setApplicants([]);
    }
    loadStats();
  }

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ fontFamily: 'Source Serif 4, serif', marginBottom: '1.5rem' }}>Employer Dashboard</h1>

      {stats && (
        <div className="dashboard-grid">
          <div className="stat-card"><h4>Active Jobs</h4><div className="num">{stats.totalJobs}</div></div>
          <div className="stat-card"><h4>Total Applications</h4><div className="num">{stats.totalApplications}</div></div>
          <div className="stat-card"><h4>In Review</h4><div className="num">{stats.byStatus?.reviewing || 0}</div></div>
          <div className="stat-card"><h4>Interviews</h4><div className="num">{stats.byStatus?.interview || 0}</div></div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>Post New Job</button>
      </div>

      {showForm && (
        <form className="form-card" style={{ marginBottom: '2rem' }} onSubmit={handleSubmitJob}>
          <h3>{editingId ? 'Edit Job' : 'New Job'}</h3>
          <input placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
          <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <input type="number" placeholder="Salary min" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
            <input type="number" placeholder="Salary max" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
          </div>
          <textarea placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input placeholder="Skills (comma-separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary">{editingId ? 'Save Changes' : 'Publish Job'}</button>
            <button type="button" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Your Listings</h3>
          {jobs.map((j) => (
            <div key={j._id} className="job-card" style={{ marginBottom: '0.5rem', border: selectedJob === j._id ? '2px solid var(--primary)' : undefined }}>
              <button style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} onClick={() => loadApplicants(j._id)}>
                <h3>{j.title}</h3>
                <div className="meta">{j.location} Â· {j.type}</div>
              </button>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="btn-secondary" onClick={() => startEdit(j)}>Edit</button>
                <button className="btn-secondary" onClick={() => handleDeactivate(j._id)}>Deactivate</button>
              </div>
            </div>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Details</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.length === 0 ? (
                <tr><td colSpan={4} style={{ color: 'var(--muted)' }}>Select a job to view applicants</td></tr>
              ) : applicants.map((a) => (
                <tr key={a._id}>
                  <td>
                    <strong>{a.applicant?.name}</strong>
                    <br /><small style={{ color: 'var(--muted)' }}>{a.applicant?.email}</small>
                  </td>
                  <td style={{ maxWidth: 220 }}>
                    {(a.applicant?.skills?.length ?? 0) > 0 && (
                      <small style={{ display: 'block', marginBottom: '0.25rem' }}>Skills: {a.applicant!.skills!.join(', ')}</small>
                    )}
                    {a.coverLetter && <small style={{ color: 'var(--muted)' }}>{a.coverLetter.slice(0, 120)}{a.coverLetter.length > 120 ? 'â€¦' : ''}</small>}
                  </td>
                  <td><span className={`badge status-${a.status}`}>{a.status}</span></td>
                  <td>
                    <input
                      placeholder="Notes"
                      value={notes[a._id] || ''}
                      onChange={(e) => setNotes({ ...notes, [a._id]: e.target.value })}
                      style={{ marginBottom: '0.35rem', width: '100%' }}
                    />
                    <select value={a.status} onChange={(e) => handleStatus(a._id, e.target.value)} style={{ maxWidth: 140 }}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

