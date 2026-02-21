import mongoose, { HydratedDocument, Model, Schema, Types } from 'mongoose';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'remote';

export interface IJob {
  title: string;
  company: string;
  location: string;
  type: JobType;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requirements: string[];
  skills: string[];
  employer: Types.ObjectId;
  active: boolean;
}

export type IJobDocument = HydratedDocument<IJob>;
export type JobModel = Model<IJob>;

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ['full-time', 'part-time', 'contract', 'remote'], default: 'full-time' },
    salaryMin: Number,
    salaryMax: Number,
    description: { type: String, required: true },
    requirements: [String],
    skills: [String],
    employer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', company: 'text' });

export default mongoose.model<IJob, JobModel>('Job', jobSchema);
