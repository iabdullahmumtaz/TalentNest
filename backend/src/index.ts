import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import User from './models/User.js';
import Job from './models/Job.js';

const app = express();
const PORT = process.env.PORT || 6018;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/talentnest';

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'TalentNest' }));
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

async function seed(): Promise<void> {
  const jobCount = await Job.countDocuments();
  if (jobCount > 0) return;

  let employer = await User.findOne({ email: 'hr@talentnest.demo' });
  if (!employer) {
    employer = await User.create({
      email: 'hr@talentnest.demo',
      password: 'employer123',
      name: 'Alex Morgan',
      role: 'employer',
      company: 'TalentNest Labs',
    });
  }

  await Job.insertMany([
    {
      title: 'Senior Full Stack Engineer',
      company: 'TalentNest Labs',
      location: 'San Francisco, CA',
      type: 'full-time',
      salaryMin: 140000,
      salaryMax: 185000,
      description: 'Build scalable hiring platforms with Node.js and React.',
      requirements: ['5+ years experience', 'Node.js', 'React'],
      skills: ['Node.js', 'React', 'MongoDB', 'TypeScript'],
      employer: employer._id,
    },
    {
      title: 'Product Designer',
      company: 'TalentNest Labs',
      location: 'Remote',
      type: 'remote',
      salaryMin: 95000,
      salaryMax: 130000,
      description: 'Design intuitive job search and employer dashboard experiences.',
      requirements: ['Portfolio required', 'Figma'],
      skills: ['Figma', 'UI/UX', 'Design Systems'],
      employer: employer._id,
    },
    {
      title: 'DevOps Engineer',
      company: 'CloudHire Inc',
      location: 'Austin, TX',
      type: 'full-time',
      salaryMin: 120000,
      salaryMax: 160000,
      description: 'Own CI/CD pipelines and Kubernetes infrastructure.',
      requirements: ['AWS', 'Docker', 'Kubernetes'],
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
      employer: employer._id,
    },
  ]);

  const applicant = await User.findOne({ email: 'jane@talentnest.demo' });
  if (!applicant) {
    await User.create({
      email: 'jane@talentnest.demo',
      password: 'applicant123',
      name: 'Jane Cooper',
      role: 'applicant',
      title: 'Software Engineer',
      skills: ['JavaScript', 'React', 'Node.js'],
    });
  }

  console.log('[Seed] Demo jobs and users created');
}

async function start(): Promise<void> {
  await mongoose.connect(MONGODB_URI);
  console.log('[MongoDB] Connected');
  await seed();
  app.listen(PORT, () => console.log(`TalentNest API on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
