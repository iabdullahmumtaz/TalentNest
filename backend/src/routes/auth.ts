import { Router, type Request, type Response } from 'express';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, company, title, skills } = req.body as {
      email?: string;
      password?: string;
      name?: string;
      role?: string;
      company?: string;
      title?: string;
      skills?: string[];
    };
    if (!email || !password || !name || !role) {
      res.status(400).json({ error: 'email, password, name, role required' });
      return;
    }
    if (!['applicant', 'employer'].includes(role)) {
      res.status(400).json({ error: 'role must be applicant or employer' });
      return;
    }
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const user = await User.create({
      email,
      password,
      name,
      role,
      company: role === 'employer' ? company : undefined,
      title,
      skills: skills || [],
    });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, email, name, role, company: user.company },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    res.status(500).json({ error: message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password || ''))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  res.json({
    token: signToken(user),
    user: { id: user._id, email: user.email, name: user.name, role: user.role, company: user.company },
  });
});

export default router;
