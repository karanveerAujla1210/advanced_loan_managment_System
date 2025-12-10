import { query, queryOne, execute } from '../models/db.js';

export const getAllBorrowers = async (req, res) => {
  const { status, search } = req.query;
  let sql = 'SELECT * FROM borrowers WHERE 1=1';
  const params = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY created_at DESC';
  const borrowers = await query(sql, params);
  res.json(borrowers);
};

export const getBorrowerById = async (req, res) => {
  const borrower = await queryOne('SELECT * FROM borrowers WHERE id = ?', [req.params.id]);
  if (!borrower) return res.status(404).json({ error: 'Borrower not found' });
  res.json(borrower);
};

export const createBorrower = async (req, res) => {
  const { firstName, lastName, dob, gender, phone, email, address, city, state, postalCode, country, idProofType, idProofNumber } = req.body;
  
  const result = await execute(
    `INSERT INTO borrowers (first_name, last_name, dob, gender, phone, email, address, city, state, postal_code, country, id_proof_type, id_proof_number)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [firstName, lastName, dob, gender, phone, email, address, city, state, postalCode, country, idProofType, idProofNumber]
  );

  res.status(201).json({ id: result.lastID });
};

export const updateBorrower = async (req, res) => {
  const { firstName, lastName, dob, gender, phone, email, address, city, state, postalCode, country, idProofType, idProofNumber, status } = req.body;
  
  await execute(
    `UPDATE borrowers SET first_name=?, last_name=?, dob=?, gender=?, phone=?, email=?, address=?, city=?, state=?, postal_code=?, country=?, id_proof_type=?, id_proof_number=?, status=?
     WHERE id=?`,
    [firstName, lastName, dob, gender, phone, email, address, city, state, postalCode, country, idProofType, idProofNumber, status, req.params.id]
  );

  res.json({ message: 'Borrower updated' });
};

export const deleteBorrower = async (req, res) => {
  await execute('DELETE FROM borrowers WHERE id = ?', [req.params.id]);
  res.json({ message: 'Borrower deleted' });
};
