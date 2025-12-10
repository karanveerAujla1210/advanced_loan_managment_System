import { query, queryOne, execute } from '../models/db.js';

export const getAllProducts = async (req, res) => {
  const products = await query('SELECT * FROM loan_products WHERE is_active = 1 ORDER BY name');
  res.json(products);
};

export const getProductById = async (req, res) => {
  const product = await queryOne('SELECT * FROM loan_products WHERE id = ?', [req.params.id]);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
};

export const createProduct = async (req, res) => {
  const { name, code, description, minPrincipal, maxPrincipal, interestRate, interestType, minTermMonths, maxTermMonths, gracePeriodDays, lateFeeType, lateFeeValue } = req.body;
  
  const result = await execute(
    `INSERT INTO loan_products (name, code, description, min_principal, max_principal, interest_rate, interest_type, min_term_months, max_term_months, grace_period_days, late_fee_type, late_fee_value)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, code, description, minPrincipal, maxPrincipal, interestRate, interestType, minTermMonths, maxTermMonths, gracePeriodDays, lateFeeType, lateFeeValue]
  );

  res.status(201).json({ id: result.lastID });
};

export const updateProduct = async (req, res) => {
  const { name, description, minPrincipal, maxPrincipal, interestRate, interestType, minTermMonths, maxTermMonths, gracePeriodDays, lateFeeType, lateFeeValue, isActive } = req.body;
  
  await execute(
    `UPDATE loan_products SET name=?, description=?, min_principal=?, max_principal=?, interest_rate=?, interest_type=?, min_term_months=?, max_term_months=?, grace_period_days=?, late_fee_type=?, late_fee_value=?, is_active=?
     WHERE id=?`,
    [name, description, minPrincipal, maxPrincipal, interestRate, interestType, minTermMonths, maxTermMonths, gracePeriodDays, lateFeeType, lateFeeValue, isActive, req.params.id]
  );

  res.json({ message: 'Product updated' });
};
