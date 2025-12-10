import { query, queryOne, execute } from '../models/db.js';
import { calculateInstallments } from '../services/loanService.js';

export const getAllLoans = async (req, res) => {
  const { status, borrowerId } = req.query;
  let sql = 'SELECT * FROM loan_summary WHERE 1=1';
  const params = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (borrowerId) {
    sql += ' AND borrower_id = ?';
    params.push(borrowerId);
  }

  sql += ' ORDER BY id DESC';
  const loans = await query(sql, params);
  res.json(loans);
};

export const getLoanById = async (req, res) => {
  const loan = await queryOne('SELECT * FROM loans WHERE id = ?', [req.params.id]);
  if (!loan) return res.status(404).json({ error: 'Loan not found' });
  
  const installments = await query('SELECT * FROM instalments WHERE loan_id = ? ORDER BY installment_number', [req.params.id]);
  res.json({ ...loan, installments });
};

export const createLoan = async (req, res) => {
  const { borrowerId, productId, principalAmount, termMonths, interestRate, startDate, purpose, collateralDetails } = req.body;
  
  const loanNumber = `LN${Date.now()}`;
  
  const result = await execute(
    `INSERT INTO loans (loan_number, borrower_id, product_id, principal_amount, term_months, interest_rate, start_date, purpose, collateral_details, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [loanNumber, borrowerId, productId, principalAmount, termMonths, interestRate, startDate, purpose, collateralDetails, req.user.id]
  );

  const installments = calculateInstallments(principalAmount, interestRate, termMonths, startDate);
  
  for (const inst of installments) {
    await execute(
      'INSERT INTO instalments (loan_id, installment_number, due_date, principal_due, interest_due) VALUES (?, ?, ?, ?, ?)',
      [result.lastID, inst.number, inst.dueDate, inst.principal, inst.interest]
    );
  }

  res.status(201).json({ id: result.lastID, loanNumber });
};

export const updateLoanStatus = async (req, res) => {
  const { status } = req.body;
  
  await execute('UPDATE loans SET status = ? WHERE id = ?', [status, req.params.id]);
  
  if (status === 'approved') {
    await execute('UPDATE loans SET approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?', [req.user.id, req.params.id]);
  }

  res.json({ message: 'Loan status updated' });
};

export const disburseLoan = async (req, res) => {
  const { disbursementDate } = req.body;
  
  await execute(
    'UPDATE loans SET status = ?, disbursement_date = ? WHERE id = ?',
    ['disbursed', disbursementDate, req.params.id]
  );

  res.json({ message: 'Loan disbursed' });
};
