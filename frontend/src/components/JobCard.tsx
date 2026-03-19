import type { Job } from '../types';
import { Link } from 'react-router-dom';

function formatSalary(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return min ? `${fmt(min)}+` : `Up to ${fmt(max!)}`;
}

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  return (
    <Link to={`/jobs/${job._id}`} className="job-card">
      <h3>{job.title}</h3>
      <div className="meta">
        <span>{job.company}</span>
        <span>{job.location}</span>
        <span className="badge">{job.type}</span>
      </div>
      {salary && <div className="salary">{salary}</div>}
      {(job.skills?.length ?? 0) > 0 && (
        <div className="skills">
          {job.skills!.slice(0, 5).map((s) => <span key={s}>{s}</span>)}
        </div>
      )}
    </Link>
  );
}
