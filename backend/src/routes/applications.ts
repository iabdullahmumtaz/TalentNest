import { Router, type Request, type Response } from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { authRequired, employerOnly } from '../middleware/auth.js';
import type { ApplicationStatus } from '../models/Application.js';

const router = Router();
const STATUSES: ApplicationStatus[] = ['applied', 'reviewing', 'interview', 'offered', 'rejected'];

router.get('/my', authRequired, async (req: Request, res: Response) => {
  const filter =
    req.userRole === 'applicant'
      ? { applicant: req.userId }
      : { job: { $in: await Job.find({ employer: req.userId }).distinct('_id') } };

  const apps = await Application.find(filter)
    .sort({ updatedAt: -1 })
    .populate('job')
    .populate('applicant', 'name email title skills resume');
  res.json(apps);
});

router.get('/job/:jobId', authRequired, employerOnly, async (req: Request, res: Response) => {
  const job = await Job.findOne({ _id: req.params.jobId, employer: req.userId });
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  const apps = await Application.find({ job: job._id })
    .populate('applicant', 'name email title skills resume')
    .sort({ createdAt: -1 });
  res.json(apps);
});

router.patch('/:id/status', authRequired, employerOnly, async (req: Request, res: Response) => {
  const { status, notes } = req.body as { status?: ApplicationStatus; notes?: string };
  const app = await Application.findById(req.params.id).populate('job');
  if (!app) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const job = await Job.findOne({ _id: app.job._id, employer: req.userId });
  if (!job) {
    res.status(403).json({ error: 'Not your job' });
    return;
  }

  if (status) app.status = status;
  if (notes !== undefined) app.notes = notes;
  await app.save();
  res.json(app);
});

router.get('/stats', authRequired, employerOnly, async (req: Request, res: Response) => {
  const jobIds = await Job.find({ employer: req.userId }).distinct('_id');
  const apps = await Application.find({ job: { $in: jobIds } });

  const byStatus: Record<string, number> = {};
  for (const s of STATUSES) {
    byStatus[s] = apps.filter((a) => a.status === s).length;
  }

  res.json({
    totalJobs: jobIds.length,
    totalApplications: apps.length,
    byStatus,
  });
});

export default router;
