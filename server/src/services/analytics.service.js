const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Borrower = require('../models/Borrower');
const Instalment = require('../models/Instalment');

class AnalyticsService {
  /**
   * Get portfolio overview KPIs
   * @param {Object} filters - Branch/date filters
   * @returns {Object} Portfolio metrics
   */
  async getPortfolioOverview(filters = {}) {
    const { branch, startDate, endDate } = filters;
    
    const matchStage = {};
    if (branch) matchStage.branch = branch;
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const [portfolioStats] = await Loan.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalLoans: { $sum: 1 },
          totalDisbursed: { $sum: '$disbursedAmount' },
          totalOutstanding: { $sum: '$outstandingPrincipal' },
          activeLoans: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          closedLoans: {
            $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
          },
          defaultedLoans: {
            $sum: { $cond: [{ $eq: ['$status', 'defaulted'] }, 1, 0] }
          },
          avgLoanSize: { $avg: '$principal' }
        }
      }
    ]);

    // Get collection efficiency
    const collectionStats = await this.getCollectionEfficiency(filters);
    
    // Get overdue analysis
    const overdueStats = await this.getOverdueAnalysis(filters);

    return {
      portfolio: portfolioStats || {
        totalLoans: 0,
        totalDisbursed: 0,
        totalOutstanding: 0,
        activeLoans: 0,
        closedLoans: 0,
        defaultedLoans: 0,
        avgLoanSize: 0
      },
      collection: collectionStats,
      overdue: overdueStats
    };
  }

  /**
   * Get collection efficiency metrics
   * @param {Object} filters - Filters
   * @returns {Object} Collection metrics
   */
  async getCollectionEfficiency(filters = {}) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const [monthlyCollection] = await Payment.aggregate([
      {
        $match: {
          collectedAt: { $gte: startOfMonth },
          ...(filters.branch && { branch: filters.branch })
        }
      },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$amount' },
          totalPayments: { $sum: 1 }
        }
      }
    ]);

    // Get due amount for the month
    const [monthlyDue] = await Instalment.aggregate([
      {
        $match: {
          dueDate: { $gte: startOfMonth, $lte: today },
          ...(filters.branch && { branch: filters.branch })
        }
      },
      {
        $group: {
          _id: null,
          totalDue: { $sum: '$emi' }
        }
      }
    ]);

    const collected = monthlyCollection?.totalCollected || 0;
    const due = monthlyDue?.totalDue || 0;
    const efficiency = due > 0 ? Math.round((collected / due) * 100) : 0;

    return {
      monthlyCollected: collected,
      monthlyDue: due,
      collectionEfficiency: efficiency,
      totalPayments: monthlyCollection?.totalPayments || 0
    };
  }

  /**
   * Get overdue analysis with buckets
   * @param {Object} filters - Filters
   * @returns {Object} Overdue analysis
   */
  async getOverdueAnalysis(filters = {}) {
    const today = new Date();
    
    const overdueInstallments = await Instalment.aggregate([
      {
        $match: {
          dueDate: { $lt: today },
          status: { $in: ['pending', 'partial'] },
          ...(filters.branch && { branch: filters.branch })
        }
      },
      {
        $addFields: {
          overdueDays: {
            $divide: [
              { $subtract: [today, '$dueDate'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $addFields: {
          bucket: {
            $switch: {
              branches: [
                { case: { $lte: ['$overdueDays', 30] }, then: '0-30' },
                { case: { $lte: ['$overdueDays', 60] }, then: '31-60' },
                { case: { $lte: ['$overdueDays', 90] }, then: '61-90' },
                { case: { $lte: ['$overdueDays', 180] }, then: '91-180' }
              ],
              default: '180+'
            }
          }
        }
      },
      {
        $group: {
          _id: '$bucket',
          count: { $sum: 1 },
          amount: { $sum: { $subtract: ['$emi', { $ifNull: ['$paidAmount', 0] }] } }
        }
      }
    ]);

    const buckets = {
      '0-30': { count: 0, amount: 0 },
      '31-60': { count: 0, amount: 0 },
      '61-90': { count: 0, amount: 0 },
      '91-180': { count: 0, amount: 0 },
      '180+': { count: 0, amount: 0 }
    };

    overdueInstallments.forEach(bucket => {
      buckets[bucket._id] = {
        count: bucket.count,
        amount: Math.round(bucket.amount * 100) / 100
      };
    });

    const totalOverdue = Object.values(buckets).reduce((sum, b) => sum + b.amount, 0);
    const totalOverdueCount = Object.values(buckets).reduce((sum, b) => sum + b.count, 0);

    return {
      buckets,
      totalOverdue: Math.round(totalOverdue * 100) / 100,
      totalOverdueCount
    };
  }

  /**
   * Get loan performance trends
   * @param {Object} filters - Filters
   * @returns {Array} Monthly trends
   */
  async getLoanTrends(filters = {}) {
    const { months = 12, branch } = filters;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const trends = await Loan.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          ...(branch && { branch })
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          loansCreated: { $sum: 1 },
          amountDisbursed: { $sum: '$disbursedAmount' },
          avgLoanSize: { $avg: '$principal' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' }
            ]
          },
          loansCreated: 1,
          amountDisbursed: { $round: ['$amountDisbursed', 2] },
          avgLoanSize: { $round: ['$avgLoanSize', 2] }
        }
      }
    ]);

    return trends;
  }

  /**
   * Get top performing branches/agents
   * @param {Object} filters - Filters
   * @returns {Object} Performance rankings
   */
  async getPerformanceRankings(filters = {}) {
    const { period = 'month' } = filters;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'month') {
      dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    } else if (period === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      dateFilter = { $gte: new Date(now.getFullYear(), quarter * 3, 1) };
    }

    // Top branches by disbursement
    const topBranches = await Loan.aggregate([
      {
        $match: {
          disbursedAt: dateFilter,
          status: { $in: ['disbursed', 'active', 'closed'] }
        }
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'branch',
          foreignField: '_id',
          as: 'branchInfo'
        }
      },
      {
        $group: {
          _id: '$branch',
          branchName: { $first: { $arrayElemAt: ['$branchInfo.name', 0] } },
          totalDisbursed: { $sum: '$disbursedAmount' },
          loanCount: { $sum: 1 },
          avgLoanSize: { $avg: '$principal' }
        }
      },
      {
        $sort: { totalDisbursed: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Top collectors by collection amount
    const topCollectors = await Payment.aggregate([
      {
        $match: {
          collectedAt: dateFilter
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'collectedBy',
          foreignField: '_id',
          as: 'collectorInfo'
        }
      },
      {
        $group: {
          _id: '$collectedBy',
          collectorName: { $first: { $arrayElemAt: ['$collectorInfo.displayName', 0] } },
          totalCollected: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalCollected: -1 }
      },
      {
        $limit: 10
      }
    ]);

    return {
      topBranches,
      topCollectors
    };
  }
}

module.exports = new AnalyticsService();