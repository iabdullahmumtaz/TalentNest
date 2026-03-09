import type { Application, Job, RegisterPayload, Stats, User } from './types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:6018';

function headers(): Record<string, string> {
  const token = localStorage.getItem('talentnest_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  localStorage.setItem('talentnest_token', data.token);
  localStorage.setItem('talentnest_user', JSON.stringify(data.user));
  return data;
}

export async function register(payload: RegisterPayload): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Registration failed');
  const data = await res.json();
  localStorage.setItem('talentnest_token', data.token);
  localStorage.setItem('talentnest_user', JSON.stringify(data.user));
  return data;
}

export function logout(): void {
  localStorage.removeItem('talentnest_token');
  localStorage.removeItem('talentnest_user');
}

export function getUser(): User | null {
  const raw = localStorage.getItem('talentnest_user');
  return raw ? (JSON.parse(raw) as User) : null;
}

export async function fetchJobs(params: Record<string, string> = {}): Promise<Job[]> {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/api/jobs?${q}`);
  return res.json();
}

export async function fetchJob(id: string): Promise<Job> {
  const res = await fetch(`${API}/api/jobs/${id}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export async function applyToJob(id: string, coverLetter: string): Promise<Application> {
  const res = await fetch(`${API}/api/jobs/${id}/apply`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ coverLetter }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Apply failed');
  }
  return res.json();
}

export async function fetchMyApplications(): Promise<Application[]> {
  const res = await fetch(`${API}/api/applications/my`, { headers: headers() });
  return res.json();
}

export async function fetchEmployerJobs(): Promise<Job[]> {
  const res = await fetch(`${API}/api/jobs/employer/mine`, { headers: headers() });
  return res.json();
}

export async function fetchJobApplicants(jobId: string): Promise<Application[]> {
  const res = await fetch(`${API}/api/applications/job/${jobId}`, { headers: headers() });
  return res.json();
}

export async function updateApplicationStatus(id: string, status: string, notes: string): Promise<Application> {
  const res = await fetch(`${API}/api/applications/${id}/status`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status, notes }),
  });
  return res.json();
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${API}/api/applications/stats`, { headers: headers() });
  return res.json();
}

export async function createJob(job: Partial<Job>): Promise<Job> {
  const res = await fetch(`${API}/api/jobs`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(job),
  });
  if (!res.ok) throw new Error('Failed to create job');
  return res.json();
}

export async function updateJob(id: string, job: Partial<Job>): Promise<Job> {
  const res = await fetch(`${API}/api/jobs/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(job),
  });
  if (!res.ok) throw new Error('Failed to update job');
  return res.json();
}

export async function deleteJob(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API}/api/jobs/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error('Failed to deactivate job');
  return res.json();
}
