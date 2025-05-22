import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Nama kategori wajib diisi'],
    },
    description: {
      type: String,
      required: [true, 'Deskripsi kategori wajib diisi'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default model<ICategory>('Category', categorySchema);
