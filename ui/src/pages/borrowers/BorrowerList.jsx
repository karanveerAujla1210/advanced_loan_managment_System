import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Upload } from 'lucide-react';
import ImportModal from '../../components/import/ImportModal';
import ExportButton from '../../components/import/ExportButton';
import CustomerForm from '../../components/forms/CustomerForm';
import api from '../../services/api';

const BorrowerList = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [filters, setFilters] = useState({
    branch: '',
    status: ''
  });

  useEffect(() => {
    fetchBorrowers();
  }, [searchTerm, filters]);

  const fetchBorrowers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/api/borrowers?${params.toString()}`);
      setBorrowers(response.data.borrowers || []);
    } catch (error) {
      console.error('Failed to fetch borrowers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportComplete = () => {
    fetchBorrowers(); // Refresh list after import
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading borrowers...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Borrowers</h1>
          <p className="text-gray-600">Manage customer profiles and KYC</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
          >
            <Upload size={16} className="mr-2" />
            Import
          </button>
          <ExportButton type="borrowers" filters={filters} />
          <button 
            onClick={() => setShowCustomerForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add Borrower
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.branch}
            onChange={(e) => setFilters(prev => ({ ...prev, branch: e.target.value }))}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Branches</option>
            <option value="BR001">Main Branch</option>
            <option value="BR002">North Branch</option>
            <option value="BR003">South Branch</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Borrowers Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrower
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KYC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {borrowers.map((borrower) => (
                <tr key={borrower._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {borrower.firstName} {borrower.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {borrower.borrowerId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{borrower.phone}</div>
                    <div className="text-sm text-gray-500">{borrower.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      PAN: {borrower.pan || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Aadhaar: {borrower.aadhaar || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {borrower.branchCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      borrower.status === 'Active' 
                        ? 'bg-green-100 text-green-800'
                        : borrower.status === 'Inactive'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {borrower.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {borrowers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No borrowers found</div>
            <button
              onClick={() => setShowImportModal(true)}
              className="mt-2 text-blue-500 hover:text-blue-600"
            >
              Import borrowers from Excel
            </button>
          </div>
        )}
      </div>

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CustomerForm
              onSuccess={() => {
                setShowCustomerForm(false);
                fetchBorrowers();
              }}
              onCancel={() => setShowCustomerForm(false)}
            />
          </div>
        </div>
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        type="borrowers"
        onComplete={handleImportComplete}
      />
    </div>
  );
};

export default BorrowerList;