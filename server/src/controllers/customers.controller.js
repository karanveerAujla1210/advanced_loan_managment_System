const customerService = require('../services/customer.service');

class CustomersController {
  async create(req, res) {
    try {
      const result = await customerService.createCustomer({
        ...req.body,
        branch: req.user.branchId || req.body.branchId
      });

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Customer created successfully',
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

  async list(req, res) {
    try {
      const result = await customerService.getCustomers(req.query);

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

  async getById(req, res) {
    try {
      const result = await customerService.getCustomerById(req.params.id);

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(404).json({
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

  async update(req, res) {
    try {
      const result = await customerService.updateCustomer(req.params.id, req.body);

      if (result.success) {
        res.json({
          success: true,
          message: 'Customer updated successfully',
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

module.exports = new CustomersController();