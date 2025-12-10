// server/src/controllers/loanEngine.controller.js
const LoanEngine = require('../services/loanEngine');
const { LOAN_PRODUCTS, DEFAULT_ENGINE_CONFIG, getProductByKey, validateLoanAmount } = require('../services/loanProducts');
const Loan = require('../models/Loan');
const Instalment = require('../models/Instalment');

// Calculate loan preview (without saving)
const calculateLoanPreview = async (req, res) => {
  try {
    const { productKey, principal, startDate } = req.body;

    // Validate inputs
    if (!productKey || !principal || !startDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product key, principal, and start date are required' 
      });
    }

    // Get product configuration
    const product = getProductByKey(productKey);
    if (!product) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product key' 
      });
    }

    // Validate loan amount
    const amountValidation = validateLoanAmount(productKey, principal);
    if (!amountValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: amountValidation.error 
      });
    }

    // Create engine and calculate
    const engine = new LoanEngine(product, DEFAULT_ENGINE_CONFIG);
    const upfrontCharges = engine.computeUpfrontCharges(principal);
    const schedule = engine.generateSchedule(principal, startDate);

    res.json({
      success: true,
      data: {
        product: {
          key: product.key,
          name: product.name,
          termDays: product.termDays,
          installments: product.installments,
          frequencyDays: product.frequencyDays,
          interestType: product.interestType
        },
        principal,
        upfrontCharges,
        schedule: {
          method: schedule.method,
          interestTotal: schedule.interestTotal,
          totalPayable: schedule.totalPayable,
          emi: schedule.emi
        },
        installments: schedule.schedule.map(inst => ({
          installmentNo: inst.installmentNo,
          dueDate: inst.dueDate,
          principalComponent: inst.principalComponent,
          interestComponent: inst.interestComponent,
          amount: inst.amount,
          outstandingPrincipal: inst.outstandingPrincipal
        }))
      }
    });

  } catch (error) {
    console.error('Calculate loan preview error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to calculate loan preview' 
    });
  }
};

// Create loan with full schedule
const createLoanWithSchedule = async (req, res) => {
  try {
    const { borrowerId, branchId, productKey, principal, startDate } = req.body;

    // Validate inputs
    if (!borrowerId || !branchId || !productKey || !principal || !startDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Get product and validate
    const product = getProductByKey(productKey);
    if (!product) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid product key' 
      });
    }

    const amountValidation = validateLoanAmount(productKey, principal);
    if (!amountValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: amountValidation.error 
      });
    }

    // Create engine and calculate
    const engine = new LoanEngine(product, DEFAULT_ENGINE_CONFIG);
    const upfrontCharges = engine.computeUpfrontCharges(principal);
    const schedule = engine.generateSchedule(principal, startDate);

    // Create loan document
    const loanData = {
      borrower: borrowerId,
      branch: branchId,
      principal,
      processingFee: upfrontCharges.processingFee,
      gstOnProcessingFee: upfrontCharges.gstOnPF,
      netDisbursed: upfrontCharges.netDisbursement,
      interestType: product.interestType,
      interestRate: product.interestRate,
      interestTotal: schedule.interestTotal,
      totalPayable: schedule.totalPayable,
      termDays: product.termDays,
      installments: product.installments,
      frequencyDays: product.frequencyDays,
      emi: schedule.emi,
      startDate: new Date(startDate),
      status: 'applied',
      createdBy: req.user.id,
      charges: [],
      instalments: []
    };

    const loan = new Loan(loanData);
    await loan.save();

    // Create installment documents
    const installmentDocs = schedule.schedule.map(inst => ({
      loan: loan._id,
      installmentNo: inst.installmentNo,
      dueDate: inst.dueDate,
      principalDue: inst.principalComponent,
      interestDue: inst.interestComponent,
      totalDue: inst.amount,
      principalComponent: inst.principalComponent,
      interestComponent: inst.interestComponent,
      outstandingPrincipal: inst.outstandingPrincipal,
      status: 'pending',
      charges: []
    }));

    const instalments = await Instalment.insertMany(installmentDocs);
    
    // Update loan with installment references
    loan.instalments = instalments.map(inst => inst._id);
    loan.scheduleGenerated = true;
    await loan.save();

    res.status(201).json({
      success: true,
      message: 'Loan created successfully',
      data: {
        loanId: loan._id,
        applicationId: loan.applicationId,
        netDisbursement: upfrontCharges.netDisbursement,
        totalPayable: schedule.totalPayable,
        installmentCount: instalments.length
      }
    });

  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create loan' 
    });
  }
};

// Apply payment to loan
const applyPayment = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { amount, paidAt, mode, reference } = req.body;

    if (!amount || !paidAt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and payment date are required' 
      });
    }

    // Get loan with installments
    const loan = await Loan.findById(loanId).populate('instalments');
    if (!loan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Loan not found' 
      });
    }

    // Get product for engine
    const productKey = Object.keys(LOAN_PRODUCTS).find(key => 
      LOAN_PRODUCTS[key].interestType === loan.interestType &&
      LOAN_PRODUCTS[key].termDays === loan.termDays
    );
    
    if (!productKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product configuration not found' 
      });
    }

    const product = LOAN_PRODUCTS[productKey];
    const engine = new LoanEngine(product, DEFAULT_ENGINE_CONFIG);

    // Convert installments to engine format
    const loanForEngine = {
      schedule: loan.instalments.map(inst => ({
        installmentNo: inst.installmentNo,
        dueDate: inst.dueDate,
        principalComponent: inst.principalComponent,
        interestComponent: inst.interestComponent,
        penaltyComponent: inst.penaltyComponent || 0,
        amount: inst.totalDue,
        outstandingPrincipal: inst.outstandingPrincipal,
        status: inst.status,
        charges: inst.charges || []
      }))
    };

    // Apply payment
    const payment = { amount, paidAt: new Date(paidAt), mode, reference };
    const result = engine.applyPayment(loanForEngine, payment);

    // Update installments in database
    for (let i = 0; i < result.loan.schedule.length; i++) {
      const scheduleItem = result.loan.schedule[i];
      const installment = loan.instalments[i];
      
      installment.principalComponent = scheduleItem.principalComponent;
      installment.interestComponent = scheduleItem.interestComponent;
      installment.penaltyComponent = scheduleItem.penaltyComponent;
      installment.status = scheduleItem.status;
      installment.charges = scheduleItem.charges;
      installment.totalPaid = installment.totalDue - (scheduleItem.principalComponent + scheduleItem.interestComponent + scheduleItem.penaltyComponent);
      
      if (scheduleItem.status === 'paid') {
        installment.paidAt = new Date(paidAt);
      }
      
      await installment.save();
    }

    res.json({
      success: true,
      message: 'Payment applied successfully',
      data: {
        paymentAmount: amount,
        prepayment: result.prepayment,
        updatedInstallments: result.loan.schedule.length
      }
    });

  } catch (error) {
    console.error('Apply payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to apply payment' 
    });
  }
};

// Apply charges (bounce, field visit, legal)
const applyCharges = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { chargeType, installmentNo, date, weeksInLegal } = req.body;

    const loan = await Loan.findById(loanId).populate('instalments');
    if (!loan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Loan not found' 
      });
    }

    // Get product for engine
    const productKey = Object.keys(LOAN_PRODUCTS).find(key => 
      LOAN_PRODUCTS[key].interestType === loan.interestType &&
      LOAN_PRODUCTS[key].termDays === loan.termDays
    );
    
    const product = LOAN_PRODUCTS[productKey];
    const engine = new LoanEngine(product, DEFAULT_ENGINE_CONFIG);

    let chargeAmount = 0;
    let chargeDetails = {};

    // Convert loan for engine
    const loanForEngine = {
      schedule: loan.instalments.map(inst => ({
        installmentNo: inst.installmentNo,
        charges: inst.charges || []
      })),
      legal: loan.legal
    };

    switch (chargeType) {
      case 'bounce':
        chargeAmount = engine.applyBounceCharge(loanForEngine, installmentNo, date);
        chargeDetails = { type: 'bounce', amount: chargeAmount };
        break;
        
      case 'field_visit':
        chargeAmount = engine.applyFieldVisitCharge(loanForEngine, installmentNo, date);
        chargeDetails = { type: 'field_visit', amount: chargeAmount };
        break;
        
      case 'legal':
        const legalCharges = engine.applyLegalCharges(loanForEngine, date, weeksInLegal || 0);
        chargeAmount = legalCharges.totalLegalCharges;
        chargeDetails = legalCharges;
        
        // Update loan legal status
        loan.legal = loanForEngine.legal;
        loan.status = 'legal';
        break;
        
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid charge type' 
        });
    }

    // Update installment if specific installment charge
    if (installmentNo && (chargeType === 'bounce' || chargeType === 'field_visit')) {
      const installment = loan.instalments.find(inst => inst.installmentNo === installmentNo);
      if (installment) {
        installment.charges = installment.charges || [];
        installment.charges.push({
          type: chargeType,
          amount: chargeAmount,
          date: new Date(date)
        });
        await installment.save();
      }
    }

    // Add to loan charges
    loan.charges = loan.charges || [];
    loan.charges.push({
      type: chargeType,
      amount: chargeAmount,
      date: new Date(date),
      instalmentNo: installmentNo
    });

    await loan.save();

    res.json({
      success: true,
      message: `${chargeType} charge applied successfully`,
      data: {
        chargeType,
        amount: chargeAmount,
        details: chargeDetails
      }
    });

  } catch (error) {
    console.error('Apply charges error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to apply charges' 
    });
  }
};

// Get available loan products
const getLoanProducts = async (req, res) => {
  try {
    const products = Object.values(LOAN_PRODUCTS).map(product => ({
      key: product.key,
      name: product.name,
      termDays: product.termDays,
      installments: product.installments,
      frequencyDays: product.frequencyDays,
      interestType: product.interestType,
      interestRate: product.interestRate,
      pfRate: product.pfRate,
      minAmount: product.minAmount,
      maxAmount: product.maxAmount,
      description: product.description
    }));

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get loan products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get loan products' 
    });
  }
};

module.exports = {
  calculateLoanPreview,
  createLoanWithSchedule,
  applyPayment,
  applyCharges,
  getLoanProducts
};