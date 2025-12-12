const User = require('../models/User');
const Loan = require('../models/Loan');
const { USER_ROLES } = require('../config/constants');

class CollectorAssignmentService {
  static async autoAssignCollector(loanId, branchId) {
    try {
      // Get all active collectors in the branch
      const collectors = await User.find({
        role: USER_ROLES.COLLECTION,
        branch: branchId,
        isActive: true
      });
      
      if (collectors.length === 0) {
        throw new Error('No active collectors found in branch');
      }
      
      // Get current loan counts for each collector
      const collectorLoads = await Promise.all(
        collectors.map(async (collector) => {
          const activeLoans = await Loan.countDocuments({
            assignedCollector: collector._id,
            status: { $in: ['ACTIVE', 'DISBURSED'] }
          });
          
          return {
            collector: collector._id,
            name: `${collector.firstName} ${collector.lastName}`,
            currentLoad: activeLoans
          };
        })
      );
      
      // Find collector with minimum load
      const selectedCollector = collectorLoads.reduce((min, current) => 
        current.currentLoad < min.currentLoad ? current : min
      );
      
      // Assign loan to selected collector
      await Loan.findByIdAndUpdate(loanId, {
        assignedCollector: selectedCollector.collector
      });
      
      return selectedCollector;
    } catch (error) {
      throw new Error(`Auto-assignment failed: ${error.message}`);
    }
  }
  
  static async reassignOverdueLoans(branchId, maxOverdueDays = 30) {
    try {
      const overdueLoans = await Loan.find({
        branch: branchId,
        daysOverdue: { $gte: maxOverdueDays },
        status: 'ACTIVE'
      }).populate('assignedCollector');
      
      const reassignments = [];
      
      for (const loan of overdueLoans) {
        // Find senior collector or legal team member
        const seniorCollector = await User.findOne({
          branch: branchId,
          role: { $in: [USER_ROLES.LEGAL, USER_ROLES.MANAGER] },
          isActive: true
        });
        
        if (seniorCollector && loan.assignedCollector._id.toString() !== seniorCollector._id.toString()) {
          await Loan.findByIdAndUpdate(loan._id, {
            assignedCollector: seniorCollector._id
          });
          
          reassignments.push({
            loanId: loan.loanId,
            from: `${loan.assignedCollector.firstName} ${loan.assignedCollector.lastName}`,
            to: `${seniorCollector.firstName} ${seniorCollector.lastName}`,
            reason: `Overdue ${loan.daysOverdue} days`
          });
        }
      }
      
      return reassignments;
    } catch (error) {
      throw new Error(`Reassignment failed: ${error.message}`);
    }
  }
  
  static async getCollectorPerformance(collectorId, startDate, endDate) {
    try {
      const collector = await User.findById(collectorId);
      if (!collector) throw new Error('Collector not found');
      
      // Get assigned loans in date range
      const assignedLoans = await Loan.find({
        assignedCollector: collectorId,
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      // Calculate performance metrics
      const totalLoans = assignedLoans.length;
      const activeLoans = assignedLoans.filter(loan => loan.status === 'ACTIVE').length;
      const closedLoans = assignedLoans.filter(loan => loan.status === 'CLOSED').length;
      const overdueLoans = assignedLoans.filter(loan => loan.daysOverdue > 0).length;
      
      const totalDisbursed = assignedLoans.reduce((sum, loan) => sum + (loan.disbursedAmount || 0), 0);
      const totalCollected = assignedLoans.reduce((sum, loan) => sum + (loan.totalPaid || 0), 0);
      
      const collectionEfficiency = totalDisbursed > 0 ? (totalCollected / totalDisbursed) * 100 : 0;
      const closureRate = totalLoans > 0 ? (closedLoans / totalLoans) * 100 : 0;
      
      return {
        collector: {
          id: collector._id,
          name: `${collector.firstName} ${collector.lastName}`
        },
        metrics: {
          totalLoans,
          activeLoans,
          closedLoans,
          overdueLoans,
          totalDisbursed,
          totalCollected,
          collectionEfficiency: Math.round(collectionEfficiency * 100) / 100,
          closureRate: Math.round(closureRate * 100) / 100
        }
      };
    } catch (error) {
      throw new Error(`Performance calculation failed: ${error.message}`);
    }
  }
  
  static async balanceWorkload(branchId) {
    try {
      const collectors = await User.find({
        role: USER_ROLES.COLLECTION,
        branch: branchId,
        isActive: true
      });
      
      if (collectors.length < 2) {
        return { message: 'Need at least 2 collectors for workload balancing' };
      }
      
      // Get current workload for each collector
      const workloads = await Promise.all(
        collectors.map(async (collector) => {
          const loans = await Loan.find({
            assignedCollector: collector._id,
            status: { $in: ['ACTIVE', 'DISBURSED'] }
          });
          
          return {
            collector,
            loans,
            count: loans.length,
            totalOutstanding: loans.reduce((sum, loan) => 
              sum + (loan.outstandingPrincipal || 0) + (loan.outstandingInterest || 0), 0)
          };
        })
      );
      
      // Sort by workload (ascending)
      workloads.sort((a, b) => a.count - b.count);
      
      const avgWorkload = workloads.reduce((sum, w) => sum + w.count, 0) / workloads.length;
      const rebalanceActions = [];
      
      // Move loans from overloaded to underloaded collectors
      for (let i = workloads.length - 1; i >= 0; i--) {
        const overloaded = workloads[i];
        if (overloaded.count <= avgWorkload) break;
        
        const excessLoans = Math.floor(overloaded.count - avgWorkload);
        const underloaded = workloads.find(w => w.count < avgWorkload);
        
        if (underloaded && excessLoans > 0) {
          const loansToMove = overloaded.loans.slice(0, excessLoans);
          
          for (const loan of loansToMove) {
            await Loan.findByIdAndUpdate(loan._id, {
              assignedCollector: underloaded.collector._id
            });
            
            rebalanceActions.push({
              loanId: loan.loanId,
              from: `${overloaded.collector.firstName} ${overloaded.collector.lastName}`,
              to: `${underloaded.collector.firstName} ${underloaded.collector.lastName}`
            });
          }
          
          // Update workload counts
          overloaded.count -= excessLoans;
          underloaded.count += excessLoans;
        }
      }
      
      return { rebalanceActions, message: `Rebalanced ${rebalanceActions.length} loans` };
    } catch (error) {
      throw new Error(`Workload balancing failed: ${error.message}`);
    }
  }
}

module.exports = CollectorAssignmentService;