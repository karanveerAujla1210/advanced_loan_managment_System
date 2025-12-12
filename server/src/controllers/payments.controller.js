const paymentService = require('../services/payment.service');

class PaymentsController {
  async addPayment(req, res) {
    try {
      const result = await paymentService.addPayment({
        ...req.body,
        collectedBy: req.user.userId,
        branchId: req.user.branchId || req.body.branchId
      });

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Payment added successfully',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPaymentHistory(req, res) {
    try {
      const result = await paymentService.getPaymentHistory(req.params.loanId);

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PaymentsController();