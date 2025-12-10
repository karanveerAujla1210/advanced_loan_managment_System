import { query, execute } from '../models/db.js';

export const allocatePayment = async (paymentId, loanId, amount) => {
  const installments = await query(
    'SELECT * FROM instalments WHERE loan_id = ? AND status != ? ORDER BY due_date',
    [loanId, 'paid']
  );

  let remaining = amount;

  for (const inst of installments) {
    if (remaining <= 0) break;

    const interestDue = inst.interest_due - inst.interest_paid;
    const principalDue = inst.principal_due - inst.principal_paid;
    const feesDue = inst.fees_due - inst.fees_paid;

    // Allocate to fees first
    if (feesDue > 0 && remaining > 0) {
      const feePayment = Math.min(feesDue, remaining);
      await execute(
        'INSERT INTO payment_allocations (payment_id, instalment_id, amount, allocation_type) VALUES (?, ?, ?, ?)',
        [paymentId, inst.id, feePayment, 'fee']
      );
      await execute(
        'UPDATE instalments SET fees_paid = fees_paid + ? WHERE id = ?',
        [feePayment, inst.id]
      );
      remaining -= feePayment;
    }

    // Then interest
    if (interestDue > 0 && remaining > 0) {
      const interestPayment = Math.min(interestDue, remaining);
      await execute(
        'INSERT INTO payment_allocations (payment_id, instalment_id, amount, allocation_type) VALUES (?, ?, ?, ?)',
        [paymentId, inst.id, interestPayment, 'interest']
      );
      await execute(
        'UPDATE instalments SET interest_paid = interest_paid + ? WHERE id = ?',
        [interestPayment, inst.id]
      );
      remaining -= interestPayment;
    }

    // Then principal
    if (principalDue > 0 && remaining > 0) {
      const principalPayment = Math.min(principalDue, remaining);
      await execute(
        'INSERT INTO payment_allocations (payment_id, instalment_id, amount, allocation_type) VALUES (?, ?, ?, ?)',
        [paymentId, inst.id, principalPayment, 'principal']
      );
      await execute(
        'UPDATE instalments SET principal_paid = principal_paid + ? WHERE id = ?',
        [principalPayment, inst.id]
      );
      remaining -= principalPayment;
    }

    // Update installment status
    const updatedInst = await query('SELECT * FROM instalments WHERE id = ?', [inst.id]);
    const totalDue = updatedInst[0].principal_due + updatedInst[0].interest_due + updatedInst[0].fees_due;
    const totalPaid = updatedInst[0].principal_paid + updatedInst[0].interest_paid + updatedInst[0].fees_paid;
    
    if (totalPaid >= totalDue) {
      await execute('UPDATE instalments SET status = ? WHERE id = ?', ['paid', inst.id]);
    } else if (totalPaid > 0) {
      await execute('UPDATE instalments SET status = ? WHERE id = ?', ['partial', inst.id]);
    }
  }
};
