const mongoose = require('mongoose');

// Validate MongoDB ObjectId
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid ${paramName}` });
    }
    
    next();
  };
};

module.exports = { validateObjectId };
