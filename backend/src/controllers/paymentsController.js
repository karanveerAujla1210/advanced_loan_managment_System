import { query, queryOne, execute } from '../models/db.js';
import { allocatePayment } from '../services/paymentService.js';

export const getAllPayments = async (req, res) => {
  const { loanId } = req.query;
  let sql = 'SELECT * FROM payments WHERE 1=1';
  const params = [];

  if (loanId) {
    sql += ' AND loan_id = ?';
    params.push(loanId);
  }

  sql += ' ORDER BY payment_date DESC';
  const payments = await query(sql, params);
  res.json(payments);
};

export const getPaymentById = async (req, res) => {
  const payment = await queryOne('SELECT * FROM payments WHERE id = ?', [req.params.id]);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  
  const allocations = await query('SELECT * FROM payment_allocations WHERE payment_id = ?', [req.params.id]);
  res.json({ ...payment, allocations });
};

export const createPayment = async (req, res) => {
  const { loanId, amount, paymentDate, paymentMethod, referenceNumber, notes } = req.body;
  
  const receiptNumber = `RCP${Date.now()}`;
  
  const result = await execute(
    'INSERT INTO payments (receipt_number, loan_id, amount, payment_date, payment_method, reference_number, notes, received_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [receiptNumber, loanId, amount, paymentDate, paymentMethod, referenceNumber, notes, req.user.id]
  );

  await allocatePayment(result.lastID, loanId, amount);

  res.status(201).json({ id: result.lastID, receiptNumber });
};

export const deletePayment = async (req, res) => {
  await execute('DELETE FROM payments WHERE id = ?', [req.params.id]);
  res.json({ message: 'Payment deleted' });
};
