import { Schema, model, Document, Types } from 'mongoose';

export interface IJob extends Document {
  title:       string;
  description: string;
  remote:      boolean;
  salary:      number;
  jobType:     'fulltime' | 'parttime' | 'contract';
  requirements:string;
  benefits:    string;
  city:        string;
  address:     string;
  phone:       string;
  category: Types.ObjectId;   // ← referensi Category
  owner: Types.ObjectId;      // ← referensi User
  isDeleted:   boolean;          // opsional jika nanti mau soft-delete
  createdAt:   Date;
  updatedAt:   Date;
}

const jobSchema = new Schema<IJob>(
  {
    title:       { type: String, required: [true, 'Title wajib diisi'] },
    description: { type: String, required: [true, 'Deskripsi wajib diisi'] },
    remote:      { type: Boolean, required: [true, 'Remote wajib diisi (true/false)'] },
    salary:      { type: Number,  required: [true, 'Salary wajib diisi'] },
    jobType:     { type: String,  enum: ['fulltime', 'parttime', 'contract'], default: 'fulltime' },
    requirements:{ type: String, required: [true, 'Requirements wajib diisi'] },
    benefits:    { type: String, required: [true, 'Benefits wajib diisi'] },
    city:        { type: String, required: [true, 'City wajib diisi'] },
    address:     { type: String, required: [true, 'Address wajib diisi'] },
    phone:       { type: String, required: [true, 'Phone wajib diisi'] },
    category:    { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    owner:       { type: Schema.Types.ObjectId, ref: 'User',     required: true },
    isDeleted:   { type: Boolean, default: false }   // boleh dihapus kalau tak diperlukan
  },
  { timestamps: true }
);

export default model<IJob>('Job', jobSchema);
