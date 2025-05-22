import { Router } from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../../../controllers/categoryController';
import { protect } from '../../../middlewares/auth';

const router = Router();

// Endpoint CRUD
router.get('/api/v1/category', getAllCategories);               // index
router.get('/api/v1/category/:id', getCategoryById);            // show
router.post('/api/v1/category', protect, createCategory);       // store
router.put('/api/v1/category/:id', protect, updateCategory);    // update
router.delete('/api/v1/category/:id', protect, deleteCategory); // delete

export default router;
