import express from 'express';
import Loan from '../mongoose-models/Loan.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const loans = await Loan.find().populate('borrower_id product_id').sort({ created_at: -1 });
    res.json({ success: true, data: loans });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('borrower_id product_id');
    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }
    res.json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const loan = await Loan.create(req.body);
    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const updateData = { status };
    
    if (status === 'disbursed') {
      updateData.disbursement_date = new Date();
    }
    
    const loan = await Loan.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
});

export default router;
