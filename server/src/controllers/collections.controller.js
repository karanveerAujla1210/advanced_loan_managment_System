const collectionsService = require('../services/collections.service');

class CollectionsController {
  async getDueToday(req, res) {
    try {
      const result = await collectionsService.getDueToday();

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

  async getOverdue(req, res) {
    try {
      const result = await collectionsService.getOverdue();

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

  async getAllOutstanding(req, res) {
    try {
      const result = await collectionsService.getAllOutstanding();

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

  async recordPTP(req, res) {
    try {
      const result = await collectionsService.recordPTP({
        ...req.body,
        collectorId: req.user.userId
      });

      if (result.success) {
        res.json({
          success: true,
          message: 'PTP recorded successfully',
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

  async addAgentNote(req, res) {
    try {
      const result = await collectionsService.addAgentNote({
        ...req.body,
        agentId: req.user.userId
      });

      if (result.success) {
        res.json({
          success: true,
          message: 'Note added successfully',
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

  async getLoanTimeline(req, res) {
    try {
      const result = await collectionsService.getLoanTimeline(req.params.loanId);

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

  async getCollectionSummary(req, res) {
    try {
      const result = await collectionsService.getCollectionSummary(req.query.collectorId);

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

module.exports = new CollectionsController();