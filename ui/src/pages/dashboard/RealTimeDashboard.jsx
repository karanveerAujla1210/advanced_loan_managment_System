import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CreditCard, 
  Calendar, 
  Target, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Download,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import DashboardCard from '../../components/ui/DashboardCard';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/cn';

// Mock data - replace with real API calls
const mockData = {
  kpis: {
    totalPortfolio: { value: '₹2.45M', delta: 12.5, trend: 'up' },
    activeLoans: { value: '1,247', delta: 8.2, trend: 'up' },
    collectionRate: { value: '94.2%', delta: -2.1, trend: 'down' },
    overdueAmount: { value: '₹185K', delta: -15.3, trend: 'up' },
    newApplications: { value: '23', delta: 45.2, trend: 'up' },
    disbursedToday: { value: '₹125K', delta: 22.1, trend: 'up' }
  },
  recentActivity: [
    { id: 1, type: 'loan_approved', borrower: 'Rajesh Kumar', amount: '₹50,000', time: '2 min ago' },
    { id: 2, type: 'payment_received', borrower: 'Priya Sharma', amount: '₹12,500', time: '5 min ago' },
    { id: 3, type: 'loan_disbursed', borrower: 'Amit Singh', amount: '₹75,000', time: '12 min ago' },
    { id: 4, type: 'overdue_alert', borrower: 'Sunita Devi', amount: '₹8,500', time: '18 min ago' }
  ],
  upcomingTasks: [
    { id: 1, task: 'Review loan applications', count: 12, priority: 'high' },
    { id: 2, task: 'Follow up overdue payments', count: 8, priority: 'urgent' },
    { id: 3, task: 'Disbursement approvals', count: 5, priority: 'medium' },
    { id: 4, task: 'KYC verifications', count: 15, priority: 'low' }
  ]
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export default function RealTimeDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'loan_approved': return <TrendingUp className="h-4 w-4 text-success-500" />;
      case 'payment_received': return <DollarSign className="h-4 w-4 text-primary-500" />;
      case 'loan_disbursed': return <CreditCard className="h-4 w-4 text-secondary-500" />;
      case 'overdue_alert': return <AlertTriangle className="h-4 w-4 text-warning-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-danger-100 text-danger-700 border-danger-200';
      case 'high': return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'medium': return 'bg-primary-100 text-primary-700 border-primary-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Real-Time Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
            Live data • Last updated: {currentTime.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
            {['today', 'week', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize",
                  selectedPeriod === period
                    ? "bg-primary-500 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {period}
              </button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Filter className="h-4 w-4" />}
          >
            Filter
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
          
          <Button
            variant="soft-primary"
            size="sm"
            leftIcon={<RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />}
            onClick={handleRefresh}
            loading={isRefreshing}
          >
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <DashboardCard
          title="Total Portfolio"
          value={mockData.kpis.totalPortfolio.value}
          delta={mockData.kpis.totalPortfolio.delta}
          icon={<DollarSign className="h-5 w-5" />}
          variant="primary"
          gradient
        >
          Active loan portfolio value
        </DashboardCard>
        
        <DashboardCard
          title="Active Loans"
          value={mockData.kpis.activeLoans.value}
          delta={mockData.kpis.activeLoans.delta}
          icon={<Users className="h-5 w-5" />}
          variant="success"
        >
          Currently active borrowers
        </DashboardCard>
        
        <DashboardCard
          title="Collection Rate"
          value={mockData.kpis.collectionRate.value}
          delta={mockData.kpis.collectionRate.delta}
          icon={<Target className="h-5 w-5" />}
          variant={mockData.kpis.collectionRate.delta >= 0 ? "success" : "warning"}
        >
          Monthly collection efficiency
        </DashboardCard>
        
        <DashboardCard
          title="Overdue Amount"
          value={mockData.kpis.overdueAmount.value}
          delta={mockData.kpis.overdueAmount.delta}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="danger"
        >
          Total outstanding overdue
        </DashboardCard>
        
        <DashboardCard
          title="New Applications"
          value={mockData.kpis.newApplications.value}
          delta={mockData.kpis.newApplications.delta}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="primary"
        >
          Applications today
        </DashboardCard>
        
        <DashboardCard
          title="Disbursed Today"
          value={mockData.kpis.disbursedToday.value}
          delta={mockData.kpis.disbursedToday.delta}
          icon={<CreditCard className="h-5 w-5" />}
          variant="success"
        >
          Total disbursement amount
        </DashboardCard>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary-500" />
                Recent Activity
              </h2>
              <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence>
                {mockData.recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.borrower}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {activity.amount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div variants={itemVariants}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-500" />
                Upcoming Tasks
              </h2>
            </div>
            
            <div className="space-y-3">
              {mockData.upcomingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 transition-colors group cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {task.task}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium border",
                        getPriorityColor(task.priority)
                      )}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {task.count}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button variant="outline" fullWidth className="mt-4">
              View All Tasks
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="bg-gradient-to-r from-primary-500 to-secondary-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
              <p className="text-primary-100">Streamline your workflow with one-click actions</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="soft" size="sm">
                New Loan Application
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                Generate Report
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                Bulk Actions
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}