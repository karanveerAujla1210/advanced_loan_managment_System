const xlsx = require('xlsx');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Borrower = require('../models/Borrower');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Lead = require('../models/Lead');
const LoanProduct = require('../models/LoanProduct');
const Branch = require('../models/Branch');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('Only Excel files allowed'));
    }
    cb(null, true);
  }
});

// Validation helpers
const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);
const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
const validateAadhaar = (aadhaar) => /^\d{4}-\d{4}-\d{4}$/.test(aadhaar) || /^\d{12}$/.test(aadhaar);

// Template generators
exports.getBorrowerTemplate = async (req, res) => {
  try {
    const template = [
      {
        firstName: 'Ramesh',
        lastName: 'Kumar',
        phone: '9876543210',
        aadhaar: '1234-1234-1234',
        pan: 'ABCDE1234F',
        address: 'Delhi',
        income: 20000,
        branchCode: 'BR001'
      }
    ];

    const ws = xlsx.utils.json_to_sheet(template);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Borrowers Template');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=borrowers_template.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeadTemplate = async (req, res) => {
  try {
    const template = [
      {
        name: 'Amit Sharma',
        phone: '9876543210',
        loanAmount: 50000,
        purpose: 'Business',
        source: 'Walk-in',
        branchCode: 'BR001'
      }
    ];

    const ws = xlsx.utils.json_to_sheet(template);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Leads Template');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=leads_template.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentTemplate = async (req, res) => {
  try {
    const template = [
      {
        loanId: 'LN001',
        amount: 5000,
        paymentDate: '2024-01-15',
        paymentMode: 'Cash',
        receiptNo: 'RCP001',
        collectedBy: 'John Doe'
      }
    ];

    const ws = xlsx.utils.json_to_sheet(template);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Payments Template');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=payments_template.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload and validate borrowers
exports.uploadBorrowers = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const workbook = xlsx.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

      let errors = [];
      let valid = [];
      const branches = await Branch.find({}, 'code');
      const branchCodes = branches.map(b => b.code);

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let rowErrors = {};

        // Validate required fields
        if (!row.firstName?.trim()) rowErrors.firstName = 'Required';
        if (!row.lastName?.trim()) rowErrors.lastName = 'Required';
        if (!row.phone?.toString().trim()) rowErrors.phone = 'Required';
        else if (!validatePhone(row.phone.toString())) rowErrors.phone = 'Invalid format';
        
        if (row.aadhaar && !validateAadhaar(row.aadhaar.toString())) {
          rowErrors.aadhaar = 'Invalid format';
        }
        
        if (row.pan && !validatePAN(row.pan.toString().toUpperCase())) {
          rowErrors.pan = 'Invalid format';
        }

        if (!row.branchCode?.trim()) rowErrors.branchCode = 'Required';
        else if (!branchCodes.includes(row.branchCode)) {
          rowErrors.branchCode = 'Branch not found';
        }

        // Check for duplicates
        if (row.phone) {
          const existing = await Borrower.findOne({ phone: row.phone });
          if (existing) rowErrors.phone = 'Already exists';
        }

        if (Object.keys(rowErrors).length > 0) {
          errors.push({ row: i + 2, errors: rowErrors, data: row });
        } else {
          // Normalize data
          valid.push({
            ...row,
            firstName: row.firstName.trim(),
            lastName: row.lastName.trim(),
            phone: row.phone.toString(),
            pan: row.pan?.toString().toUpperCase(),
            aadhaar: row.aadhaar?.toString(),
            income: parseFloat(row.income) || 0
          });
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        preview: valid.slice(0, 10),
        validCount: valid.length,
        errorCount: errors.length,
        errors: errors.slice(0, 50), // Limit errors shown
        totalRows: rows.length
      });

    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  }
];

// Confirm borrower import
exports.confirmBorrowerImport = async (req, res) => {
  try {
    const { validRows } = req.body;
    
    if (!validRows || !Array.isArray(validRows)) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    const result = await Borrower.insertMany(validRows, { ordered: false });
    
    // Generate import report
    const reportData = [
      { 
        Summary: 'Import Complete',
        'Total Rows': validRows.length,
        'Successfully Imported': result.length,
        'Import Date': new Date().toISOString().split('T')[0],
        'Imported By': req.user.username
      }
    ];

    const ws = xlsx.utils.json_to_sheet(reportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Import Summary');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=borrower_import_report.xlsx');
    res.send(buffer);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload and validate leads
exports.uploadLeads = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const workbook = xlsx.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

      let errors = [];
      let valid = [];
      const branches = await Branch.find({}, 'code');
      const branchCodes = branches.map(b => b.code);

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let rowErrors = {};

        if (!row.name?.trim()) rowErrors.name = 'Required';
        if (!row.phone?.toString().trim()) rowErrors.phone = 'Required';
        else if (!validatePhone(row.phone.toString())) rowErrors.phone = 'Invalid format';
        
        if (!row.loanAmount || parseFloat(row.loanAmount) <= 0) {
          rowErrors.loanAmount = 'Invalid amount';
        }

        if (!row.branchCode?.trim()) rowErrors.branchCode = 'Required';
        else if (!branchCodes.includes(row.branchCode)) {
          rowErrors.branchCode = 'Branch not found';
        }

        if (Object.keys(rowErrors).length > 0) {
          errors.push({ row: i + 2, errors: rowErrors, data: row });
        } else {
          valid.push({
            ...row,
            name: row.name.trim(),
            phone: row.phone.toString(),
            loanAmount: parseFloat(row.loanAmount),
            status: 'New',
            createdBy: req.user._id
          });
        }
      }

      fs.unlinkSync(req.file.path);

      res.json({
        preview: valid.slice(0, 10),
        validCount: valid.length,
        errorCount: errors.length,
        errors: errors.slice(0, 50),
        totalRows: rows.length
      });

    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: error.message });
    }
  }
];

// Confirm lead import
exports.confirmLeadImport = async (req, res) => {
  try {
    const { validRows } = req.body;
    const result = await Lead.insertMany(validRows, { ordered: false });
    
    res.json({ 
      status: 'success', 
      imported: result.length,
      message: `Successfully imported ${result.length} leads`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export functions
exports.exportBorrowers = async (req, res) => {
  try {
    const { branch, from, to } = req.query;
    let query = {};
    
    if (branch) query.branchCode = branch;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const borrowers = await Borrower.find(query)
      .populate('branchCode', 'name')
      .lean();

    const exportData = borrowers.map(b => ({
      'Borrower ID': b.borrowerId,
      'First Name': b.firstName,
      'Last Name': b.lastName,
      'Phone': b.phone,
      'Aadhaar': b.aadhaar,
      'PAN': b.pan,
      'Address': b.address,
      'Income': b.income,
      'Branch': b.branchCode?.name || b.branchCode,
      'Created Date': new Date(b.createdAt).toLocaleDateString()
    }));

    const ws = xlsx.utils.json_to_sheet(exportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Borrowers');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=borrowers_export.xlsx');
    res.send(buffer);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportLoans = async (req, res) => {
  try {
    const { branch, status, from, to } = req.query;
    let query = {};
    
    if (branch) query.branchCode = branch;
    if (status) query.status = status;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const loans = await Loan.find(query)
      .populate('borrower', 'firstName lastName phone')
      .populate('product', 'name')
      .lean();

    const exportData = loans.map(l => ({
      'Loan ID': l.loanId,
      'Borrower': `${l.borrower?.firstName} ${l.borrower?.lastName}`,
      'Phone': l.borrower?.phone,
      'Product': l.product?.name,
      'Amount': l.principalAmount,
      'Interest Rate': l.interestRate,
      'Tenure': l.tenure,
      'EMI': l.emiAmount,
      'Status': l.status,
      'Disbursed Date': l.disbursedDate ? new Date(l.disbursedDate).toLocaleDateString() : '',
      'Created Date': new Date(l.createdAt).toLocaleDateString()
    }));

    const ws = xlsx.utils.json_to_sheet(exportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Loans');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=loans_export.xlsx');
    res.send(buffer);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};