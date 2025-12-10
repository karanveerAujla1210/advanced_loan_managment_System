import React from "react";
import { useNavigate } from "react-router-dom";

export default function ReportsHome() {
  const navigate = useNavigate();

  const reportTiles = [
    {
      id: "portfolio",
      title: "Portfolio Analysis",
      description: "Complete loan book overview with KPIs",
      icon: "📊",
      path: "/reports/portfolio",
      color: "bg-blue-500"
    },
    {
      id: "aging",
      title: "Aging Buckets",
      description: "DPD-wise loan distribution analysis",
      icon: "⏰",
      path: "/reports/aging",
      color: "bg-orange-500"
    },
    {
      id: "collection",
      title: "Collection Report",
      description: "Payment collection tracking",
      icon: "💰",
      path: "/reports/collection",
      color: "bg-green-500"
    },
    {
      id: "disbursement",
      title: "Disbursement Report",
      description: "Loan disbursement tracking",
      icon: "📤",
      path: "/reports/disbursement",
      color: "bg-purple-500"
    },
    {
      id: "npa",
      title: "NPA Overview",
      description: "Non-performing assets tracker",
      icon: "⚠️",
      path: "/reports/npa",
      color: "bg-red-500"
    },
    {
      id: "legal",
      title: "Legal Insights",
      description: "Legal cases and proceedings",
      icon: "⚖️",
      path: "/reports/legal",
      color: "bg-gray-600"
    },
    {
      id: "agent-performance",
      title: "Agent Performance",
      description: "Collection agent efficiency",
      icon: "👥",
      path: "/reports/agent-performance",
      color: "bg-indigo-500"
    },
    {
      id: "branch-performance",
      title: "Branch Performance",
      description: "Branch-wise KPI comparison",
      icon: "🏢",
      path: "/reports/branch-performance",
      color: "bg-teal-500"
    },
    {
      id: "borrowers",
      title: "Borrower Master",
      description: "Complete borrower database export",
      icon: "📋",
      path: "/reports/borrowers",
      color: "bg-yellow-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports Dashboard</h2>
          <p className="text-gray-600 mt-1">Generate comprehensive reports for your loan portfolio</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">9</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Export Formats</p>
              <p className="text-2xl font-bold text-gray-900">Excel & CSV</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🔒</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Access Control</p>
              <p className="text-2xl font-bold text-gray-900">Role-based</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Real-time</p>
              <p className="text-2xl font-bold text-gray-900">Live Data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTiles.map((report) => (
          <div
            key={report.id}
            onClick={() => navigate(report.path)}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-gray-300"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg ${report.color} text-white`}>
                  <span className="text-2xl">{report.icon}</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{report.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Excel
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    CSV
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <span>View Report</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Advanced Filters</p>
              <p className="text-sm text-gray-600">Branch, date, product filters</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Export Options</p>
              <p className="text-sm text-gray-600">Excel & CSV downloads</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Real-time Data</p>
              <p className="text-sm text-gray-600">Live portfolio insights</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Secure Access</p>
              <p className="text-sm text-gray-600">Role-based permissions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}