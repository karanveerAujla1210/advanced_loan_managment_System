import express from 'express';
import Payment from '../mongoose-models/Payment.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/loan/:loanId', async (req, res, next) => {
  try {
    const payments = await Payment.find({ loan_id: req.params.loanId }).sort({ payment_date: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
});

export default router;
