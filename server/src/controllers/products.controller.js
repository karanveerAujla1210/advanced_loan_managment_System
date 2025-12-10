const LoanProduct = require('../models/LoanProduct');

exports.list = async (req, res) => {
  try {
    const { active } = req.query;
    const query = active !== undefined ? { active: active === 'true' } : {};
    
    const products = await LoanProduct.find(query).sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const product = await LoanProduct.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await LoanProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await LoanProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
