const Lead = require('../models/Lead');
const Borrower = require('../models/Borrower');

class LeadsController {
  // POST /leads
  async create(req, res) {
    try {
      const lead = new Lead({
        ...req.body,
        assignedTo: req.user.userId,
        branch: req.user.branchId
      });

      await lead.save();
      await lead.populate('assignedTo', 'name username');
      
      res.status(201).json(lead);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // GET /leads
  async list(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        status, 
        source, 
        assignedTo,
        priority 
      } = req.query;
      
      const query = {};

      // Branch-based filtering
      if (req.user.role !== 'ADMIN') {
        query.branch = req.user.branchId;
      }

      // Role-based filtering
      if (['COUNSELLOR', 'COLLECTION'].includes(req.user.role)) {
        query.assignedTo = req.user.userId;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      if (status) query.status = status;
      if (source) query.source = source;
      if (assignedTo) query.assignedTo = assignedTo;
      if (priority) query.priority = priority;

      const leads = await Lead.find(query)
        .populate('assignedTo', 'name username')
        .populate('branch', 'name code')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Lead.countDocuments(query);

      res.json({
        leads,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /leads/:id
  async getById(req, res) {
    try {
      const lead = await Lead.findById(req.params.id)
        .populate('assignedTo', 'name username phone email')
        .populate('branch', 'name code address');
      
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PUT /leads/:id
  async update(req, res) {
    try {
      const lead = await Lead.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name username');

      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // PUT /leads/:id/status
  async updateStatus(req, res) {
    try {
      const { status, remarks } = req.body;
      
      const lead = await Lead.findByIdAndUpdate(
        req.params.id,
        { 
          status,
          ...(remarks && { $push: { remarks: { text: remarks, by: req.user.userId } } })
        },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name username');

      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // POST /leads/:id/convert
  async convert(req, res) {
    try {
      const lead = await Lead.findById(req.params.id);
      
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      if (lead.status !== 'QUALIFIED') {
        return res.status(400).json({ message: 'Only qualified leads can be converted' });
      }

      // Create borrower from lead
      const borrower = new Borrower({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        address: lead.address,
        branch: lead.branch,
        leadId: lead._id,
        kycStatus: 'PENDING',
        status: 'ACTIVE'
      });

      await borrower.save();

      // Update lead status
      lead.status = 'CONVERTED';
      lead.convertedToBorrower = borrower._id;
      lead.convertedAt = new Date();
      lead.convertedBy = req.user.userId;
      await lead.save();

      res.json({
        message: 'Lead converted successfully',
        borrower,
        lead
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // POST /leads/:id/note
  async addNote(req, res) {
    try {
      const { note } = req.body;
      
      const lead = await Lead.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            notes: {
              text: note,
              by: req.user.userId,
              createdAt: new Date()
            }
          }
        },
        { new: true }
      ).populate('assignedTo', 'name username');

      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new LeadsController();