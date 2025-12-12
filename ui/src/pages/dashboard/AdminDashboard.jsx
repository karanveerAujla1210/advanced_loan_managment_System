import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardCard from "../../components/ui/DashboardCard";
import api from "../../services/api";

export default function AdminDashboard() {
  const [kpis, setKpis] = useState({});
  const [recentLoans, setRecentLoans] = useState([]);
  const [recentDisbursements, setRecentDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [kpiRes, activitiesRes] = await Promise.all([
        api.get("/dashboard/kpis"),
        api.get("/dashboard/activities")
      ]);
      setKpis(kpiRes.data);
      setRecentLoans(activitiesRes.data.recentLoans || []);
      setRecentDisbursements(activitiesRes.data.recentDisbursements || []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your loan portfolio</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary focus:ring-opacity-20"
        >
          Refresh
        </motion.button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Disbursements"
          value={`₹${(kpis.totalDisbursementAmount || 0).toLocaleString()}`}
          icon="💸"
          loading={loading}
        >
          {kpis.totalDisbursements || 0} loans disbursed
        </DashboardCard>

        <DashboardCard
          title="Net Disbursement"
          value={`₹${(kpis.totalNetDisbursement || 0).toLocaleString()}`}
          icon="💰"
          loading={loading}
        >
          After fees & charges
        </DashboardCard>

        <DashboardCard
          title="Active Loans"
          value={kpis.activeLoans || 0}
          delta={kpis.loanGrowth}
          icon="📋"
          loading={loading}
        >
          {kpis.todayDisbursements || 0} disbursed today
        </DashboardCard>

        <DashboardCard
          title="Processing Fees"
          value={`₹${(kpis.totalProcessingFees || 0).toLocaleString()}`}
          icon="📊"
          loading={loading}
        >
          Total fees collected
        </DashboardCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Disbursements */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900">Recent Disbursements</h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : recentDisbursements.length > 0 ? (
              <div className="space-y-3">
                {recentDisbursements.slice(0, 5).map(disbursement => (
                  <div key={disbursement.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{disbursement.customerName}</div>
                      <div className="text-sm text-gray-500">{disbursement.loanId} • {disbursement.branch}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹ {disbursement.loanAmount?.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{new Date(disbursement.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">No recent disbursements</div>
            )}
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900">Portfolio Trends</h3>
          </div>
          <div className="p-4">
            <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <div>Charts coming soon</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Loans Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900">Top Overdue Loans</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrower
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overdue Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Past Due
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No overdue loans found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}