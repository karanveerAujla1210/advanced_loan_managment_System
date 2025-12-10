import React, { useState } from 'react';
import { Download, Calendar, Filter } from 'lucide-react';
import api from '../../services/api';

const ExportButton = ({ type = 'borrowers', filters = {} }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    from: '',
    to: '',
    branch: '',
    status: ''
  });
  const [exporting, setExporting] = useState(false);

  const typeConfig = {
    borrowers: {
      title: 'Export Borrowers',
      endpoint: '/api/import/export/borrowers',
      filename: 'borrowers_export.xlsx'
    },
    loans: {
      title: 'Export Loans',
      endpoint: '/api/import/export/loans',
      filename: 'loans_export.xlsx'
    },
    payments: {
      title: 'Export Payments',
      endpoint: '/api/import/export/payments',
      filename: 'payments_export.xlsx'
    }
  };

  const config = typeConfig[type];

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      
      // Add filters
      Object.entries({ ...filters, ...exportFilters }).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`${config.endpoint}?${params.toString()}`, {
        responseType: 'blob'
      });

      // Download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', config.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setShowFilters(false);
    } catch (error) {
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"
      >
        <Download size={16} className="mr-2" />
        {config.title}
      </button>

      {showFilters && (
        <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg p-4 w-80 z-50">
          <h3 className="font-medium mb-3 flex items-center">
            <Filter size={16} className="mr-2" />
            Export Filters
          </h3>
          
          <div className="space-y-3">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">From Date</label>
                <input
                  type="date"
                  value={exportFilters.from}
                  onChange={(e) => setExportFilters(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">To Date</label>
                <input
                  type="date"
                  value={exportFilters.to}
                  onChange={(e) => setExportFilters(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full border rounded px-2 py-1 text-sm"
                />
              </div>
            </div>

            {/* Branch Filter */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Branch</label>
              <select
                value={exportFilters.branch}
                onChange={(e) => setExportFilters(prev => ({ ...prev, branch: e.target.value }))}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                <option value="">All Branches</option>
                <option value="BR001">Main Branch</option>
                <option value="BR002">North Branch</option>
                <option value="BR003">South Branch</option>
              </select>
            </div>

            {/* Status Filter (for loans) */}
            {type === 'loans' && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select
                  value={exportFilters.status}
                  onChange={(e) => setExportFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Closed">Closed</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={() => setShowFilters(false)}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 disabled:opacity-50 text-sm"
            >
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;