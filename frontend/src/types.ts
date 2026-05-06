export type UserRole = 'applicant' | 'employer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requirements?: string[];
  skills?: string[];
  createdAt?: string;
}

export interface Application {
  _id: string;
  job?: Job;
  applicant?: { name: string; email: string; title?: string; skills?: string[] };
  coverLetter?: string;
  status: string;
  createdAt?: string;
}

export interface Stats {
  totalJobs: number;
  totalApplications: number;
  byStatus?: Record<string, number>;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  company?: string;
}
