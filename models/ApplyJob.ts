import { Schema, model, Types, Document } from 'mongoose';

export interface IApplyJob extends Document {
  user: Types.ObjectId;
  job: Types.ObjectId;
  fullname: string;
  resumeUrl: string;
  contactPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

const applyJobSchema = new Schema<IApplyJob>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job:  { type: Schema.Types.ObjectId, ref: 'Job',  required: true },
    fullname:      { type: String, required: true },
    resumeUrl:     { type: String, required: true },
    contactPhone:  { type: String, required: true },
  },
  { timestamps: true }
);

export default model<IApplyJob>('ApplyJob', applyJobSchema);
