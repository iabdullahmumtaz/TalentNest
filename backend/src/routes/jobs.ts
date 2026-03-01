import { Router, type Request, type Response } from 'express';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { authRequired, employerOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { search, location, type, skills } = req.query;
  const filter: Record<string, unknown> = { active: true };

  if (search) filter.$text = { $search: String(search) };
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (type) filter.type = type;
  if (skills) {
    const list = String(skills).split(',').map((s) => s.trim());
    filter.skills = { $in: list };
  }

  const jobs = await Job.find(filter)
    .sort({ createdAt: -1 })
    .populate('employer', 'name company');
  res.json(jobs);
});

router.get('/employer/mine', authRequired, employerOnly, async (req: Request, res: Response) => {
  const jobs = await Job.find({ employer: req.userId }).sort({ createdAt: -1 });
  res.json(jobs);
});

router.get('/:id', async (req: Request, res: Response) => {
  const job = await Job.findById(req.params.id).populate('employer', 'name company');
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
});

router.post('/', authRequired, employerOnly, async (req: Request, res: Response) => {
  const job = await Job.create({ ...req.body, employer: req.userId });
  res.status(201).json(job);
});

router.put('/:id', authRequired, employerOnly, async (req: Request, res: Response) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, employer: req.userId },
    req.body,
    { new: true }
  );
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json(job);
});

router.delete('/:id', authRequired, employerOnly, async (req: Request, res: Response) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, employer: req.userId },
    { active: false },
    { new: true }
  );
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.json({ message: 'Job deactivated' });
});

router.post('/:id/apply', authRequired, async (req: Request, res: Response) => {
  if (req.userRole !== 'applicant') {
    res.status(403).json({ error: 'Applicants only' });
    return;
  }
  try {
    const app = await Application.create({
      job: req.params.id,
      applicant: req.userId,
      coverLetter: (req.body as { coverLetter?: string }).coverLetter,
    });
    const populated = await app.populate(['job', 'applicant']);
    res.status(201).json(populated);
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
      res.status(409).json({ error: 'Already applied' });
      return;
    }
    const message = err instanceof Error ? err.message : 'Apply failed';
    res.status(500).json({ error: message });
  }
});

export default router;
