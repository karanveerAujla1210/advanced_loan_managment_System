import express from 'express';
import Product from '../mongoose-models/Product.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find({ is_active: true }).sort({ name: 1 });
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

export default router;
