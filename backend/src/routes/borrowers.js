import express from 'express';
import Borrower from '../mongoose-models/Borrower.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const borrowers = await Borrower.find().sort({ created_at: -1 });
    res.json({ success: true, data: borrowers });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) {
      return res.status(404).json({ success: false, error: 'Borrower not found' });
    }
    res.json({ success: true, data: borrower });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const borrower = await Borrower.create(req.body);
    res.status(201).json({ success: true, data: borrower });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const borrower = await Borrower.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!borrower) {
      return res.status(404).json({ success: false, error: 'Borrower not found' });
    }
    res.json({ success: true, data: borrower });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Borrower.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Borrower deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
