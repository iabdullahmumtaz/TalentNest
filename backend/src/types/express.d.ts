import type { IUserDocument } from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: 'applicant' | 'employer';
      user?: IUserDocument;
    }
  }
}
export {};
