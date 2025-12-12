const Borrower = require('../models/Borrower');

class CustomerService {
  async createCustomer(customerData) {
    try {
      const customerId = await this.generateCustomerId();
      const customer = new Borrower({
        customerId,
        ...customerData
      });
      
      await customer.save();
      return { success: true, data: customer };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCustomers(query = {}) {
    try {
      const { page = 1, limit = 10, search, status } = query;
      const filter = {};
      
      if (search) {
        filter.$or = [
          { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
          { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
          { 'contact.phone': { $regex: search, $options: 'i' } },
          { customerId: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (status) filter.status = status;

      const customers = await Borrower.find(filter)
        .populate('branch', 'name code')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Borrower.countDocuments(filter);

      return {
        success: true,
        data: {
          customers,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCustomerById(id) {
    try {
      const customer = await Borrower.findById(id)
        .populate('branch', 'name code address')
        .populate('assignedTo', 'name username');
      
      if (!customer) {
        return { success: false, error: 'Customer not found' };
      }

      return { success: true, data: customer };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateCustomer(id, updateData) {
    try {
      const customer = await Borrower.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate(['branch', 'assignedTo']);

      if (!customer) {
        return { success: false, error: 'Customer not found' };
      }

      return { success: true, data: customer };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateCustomerId() {
    const currentYear = new Date().getFullYear();
    const prefix = `CU${currentYear}`;
    
    const lastCustomer = await Borrower.findOne({
      customerId: { $regex: `^${prefix}` }
    }).sort({ customerId: -1 });

    let sequence = 1;
    if (lastCustomer) {
      const lastSequence = parseInt(lastCustomer.customerId.substring(prefix.length));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }
}

module.exports = new CustomerService();