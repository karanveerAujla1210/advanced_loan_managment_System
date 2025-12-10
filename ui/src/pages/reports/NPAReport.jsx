import React, { useState, useEffect } from "react";
import api from "../../services/api";

export default function NPAReport() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    branch: ""
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.branch) params.append("branch", filters.branch);
      
      const response = await api.get(`/reports/npa?${params}`);
      setData(response.data.data);
      setSummary({
        totalNPA: response.data.totalNPA,
        totalCount: response.data.totalCount
      });
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    const params = new URLSearchParams();
    if (filters.branch) params.append("branch", filters.branch);
    params.append("format", "excel");
    
    window.location.href = `${import.meta.env.VITE_API_URL}/reports/npa?${params}`;
  };

  const exportCSV = () => {
    const params = new URLSearchParams();
    if (filters.branch) params.append("branch", filters.branch);
    params.append("format", "csv");
    
    window.location.href = `${import.meta.env.VITE_API_URL}/reports/npa?${params}`;
  };

  useEffect(() => {
    generateReport();
  }, []);

  const getBucketColor = (bucket) => {
    switch (bucket) {
      case "90-120": return "bg-orange-100 text-orange-800";
      case "120-180": return "bg-red-100 text-red-800";
      case "180+": return "bg-red-200 text-red-900";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">NPA Tracker Report</h2>
        <div className="text-sm text-gray-600">
          Non-Performing Assets (DPD > 90 days)
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select
              value={filters.branch}
              onChange={(e) => setFilters({...filters, branch: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Branches</option>
              <option value="branch1">Branch 1</option>
              <option value="branch2">Branch 2</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={generateReport}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
          
          <button
            onClick={exportExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Export Excel
          </button>
          
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary.totalNPA && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total NPA Amount</h3>
            <p className="text-2xl font-bold text-red-600">₹{summary.totalNPA?.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">NPA Accounts</h3>
            <p className="text-2xl font-bold text-orange-600">{summary.totalCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Average NPA</h3>
            <p className="text-2xl font-bold text-purple-600">
              ₹{summary.totalCount ? Math.round(summary.totalNPA / summary.totalCount).toLocaleString() : 0}
            </p>
          </div>
        </div>
      )}

      {/* Alert Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              High Priority Recovery Required
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>These accounts require immediate attention for recovery actions. Consider legal proceedings for accounts with DPD > 180 days.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrower
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outstanding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DPD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bucket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.loanId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.borrower}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{row.outstanding?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      row.dpd > 180 ? 'bg-red-200 text-red-900' :
                      row.dpd > 120 ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {row.dpd} days
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.lastPaymentDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBucketColor(row.bucket)}`}>
                      {row.bucket}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.branch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 text-xs">
                        Call
                      </button>
                      <button className="text-orange-600 hover:text-orange-900 text-xs">
                        Visit
                      </button>
                      {row.dpd > 180 && (
                        <button className="text-red-600 hover:text-red-900 text-xs">
                          Legal
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No NPA accounts found. This is good news!
          </div>
        )}
      </div>

      {/* Recovery Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Recovery Action Guidelines</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>90-120 days:</strong> Intensive calling, field visits, payment reminders</p>
          <p><strong>120-180 days:</strong> Final notice, guarantor involvement, asset verification</p>
          <p><strong>180+ days:</strong> Legal notice, court filing, asset recovery proceedings</p>
        </div>
      </div>
    </div>
  );
}