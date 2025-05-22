import { Request, Response, RequestHandler } from 'express';
import Category, { ICategory } from '../models/Category';
import Job from '../models/Job';

// helper: hanya dua nama ini yang boleh
const ALLOWED = ['Administrator', 'Testing'];

// ---------- Store ----------
export const createCategory: RequestHandler = async (req, res) => {
  try {
    const user = req.user! as { name: string };
    if (!ALLOWED.includes(user.name)) {
      res.status(403).json({ message: 'Anda tidak memiliki akses membuat kategori' });
      return;
    }

    const { name, description } = req.body as Pick<ICategory, 'name' | 'description'>;

    if (!name || !description) {
      res.status(400).json({ message: 'Nama dan Deskripsi wajib diisi' });
    }

    const category = new Category({ name, description });
    await category.save();

    res.status(201).json({ message: 'Kategori berhasil dibuat', data: category });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// ---------- Index ----------
export const getAllCategories: RequestHandler = async (_, res) => {
  try {
    const categories = await Category.find({ isDeleted: false });
    res.json({ message: 'Tampil Semua Category', data: categories });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

// ---------- Show ----------
export const getCategoryById: RequestHandler = async (req, res) => {
  try {
    /* 1️⃣ ambil kategori (belum terhapus) */
    const category = await Category.findOne({ _id: req.params.id, isDeleted: false }).lean(); // .lean -> objekt JS biasa, memudahkan kita menambah listJobs
    
    if (!category) {
        res.status(404).json({ message: 'Kategori tidak ditemukan' });
        return;
    }

    /* 2️⃣ ambil semua job yg terkait & belum soft-delete */
    const jobs = await Job.find({
        category: category._id,
        isDeleted: false,
      })
        .populate({                   // populate owner (hanya _id, name, email)
          path: 'owner',
          select: 'name email',
        })
        .lean();

    /* 3️⃣ gabungkan & kirim respons */
    res.json({
        message: 'Detail data category',
        category: {
          ...category,           // _id, name, description, createdAt, dsb.
          listJobs: jobs,        // tambahan array
        },
    });

    // res.json({ message: 'Detail data category', data: category });
  } catch (err) {
    res.status(400).json({ message: 'ID tidak valid' });
  }
};

// ---------- Update ----------
export const updateCategory: RequestHandler = async (req, res) => {
  try {
    const user = req.user! as { name: string };
    if (!ALLOWED.includes(user.name)) {
      res.status(403).json({ message: 'Anda tidak memiliki akses mengubah kategori' });
      return;
    }

    const category = await Category.findById(req.params.id);

    if (!category || category.isDeleted) {
      res.status(404).json({ message: 'Kategori tidak ditemukan atau sudah dihapus' });
      return;
    }

    category.name = req.body.name ?? category.name;
    category.description = req.body.description ?? category.description;

    const updated = await category.save();
    res.json({ message: 'Kategori berhasil diupdate', data: updated });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

// ---------- Soft Delete ----------
export const deleteCategory: RequestHandler = async (req, res) => {
  try {
    const user = req.user! as { name: string };
    if (!ALLOWED.includes(user.name)) {
      res.status(403).json({ message: 'Anda tidak memiliki akses menghapus kategori' });
      return;
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(404).json({ message: 'Kategori tidak ditemukan' });
        return;
    }

    if (category.isDeleted) {
        res.status(400).json({ message: 'Kategori sudah dihapus' });
        return;
    }

    category.isDeleted = true;
    await category.save();
    res.json({ message: 'Kategori berhasil dihapus (soft delete)' });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};
