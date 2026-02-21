import mongoose, { HydratedDocument, Model, Schema, Types } from 'mongoose';

export type ApplicationStatus = 'applied' | 'reviewing' | 'interview' | 'offered' | 'rejected';

export interface IApplication {
  job: Types.ObjectId;
  applicant: Types.ObjectId;
  coverLetter?: string;
  status: ApplicationStatus;
  notes?: string;
}

export type IApplicationDocument = HydratedDocument<IApplication>;
export type ApplicationModel = Model<IApplication>;

const applicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coverLetter: String,
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'interview', 'offered', 'rejected'],
      default: 'applied',
    },
    notes: String,
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export default mongoose.model<IApplication, ApplicationModel>('Application', applicationSchema);
