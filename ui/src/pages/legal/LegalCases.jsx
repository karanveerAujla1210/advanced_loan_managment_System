import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Gavel, FileText, Calendar, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export default function LegalCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    caseType: '',
    search: ''
  });

  useEffect(() => {
    fetchLegalCases();
  }, [filters]);

  const fetchLegalCases = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.caseType) params.append('caseType', filters.caseType);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/legal-cases?${params}`);
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching legal cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NOTICE_SENT': return 'bg-yellow-100 text-yellow-800';
      case 'CASE_FILED': return 'bg-blue-100 text-blue-800';
      case 'HEARING_SCHEDULED': return 'bg-purple-100 text-purple-800';
      case 'JUDGMENT_PENDING': return 'bg-orange-100 text-orange-800';
      case 'SETTLED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Legal Cases</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Case
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search cases..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="NOTICE_SENT">Notice Sent</option>
            <option value="CASE_FILED">Case Filed</option>
            <option value="HEARING_SCHEDULED">Hearing Scheduled</option>
            <option value="JUDGMENT_PENDING">Judgment Pending</option>
            <option value="SETTLED">Settled</option>
            <option value="CLOSED">Closed</option>
          </select>
          
          <select
            value={filters.caseType}
            onChange={(e) => setFilters({...filters, caseType: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="RECOVERY">Recovery</option>
            <option value="NOTICE">Notice</option>
            <option value="COURT_CASE">Court Case</option>
            <option value="ARBITRATION">Arbitration</option>
          </select>
          
          <button
            onClick={() => setFilters({ status: '', caseType: '', search: '' })}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notice Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {cases.filter(c => c.status === 'NOTICE_SENT').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Gavel className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Cases</p>
              <p className="text-2xl font-bold text-gray-900">
                {cases.filter(c => ['CASE_FILED', 'HEARING_SCHEDULED', 'JUDGMENT_PENDING'].includes(c.status)).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Settled</p>
              <p className="text-2xl font-bold text-gray-900">
                {cases.filter(c => c.status === 'SETTLED').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Important Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cases.map((legalCase) => (
                <motion.tr
                  key={legalCase._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{legalCase.caseId}</div>
                      <div className="text-sm text-gray-500">{legalCase.caseType}</div>
                      <div className="text-sm text-gray-500">Court: {legalCase.courtName || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{legalCase.borrower?.name}</div>
                      <div className="text-sm text-gray-500">{legalCase.borrower?.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{legalCase.loan?.loanId}</div>
                      <div className="text-sm text-gray-500">Outstanding: ₹{legalCase.outstandingAmount?.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">DPD: {legalCase.loan?.dpd || 0} days</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(legalCase.status)}`}>
                      {legalCase.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {legalCase.noticeDate && (
                        <div>Notice: {new Date(legalCase.noticeDate).toLocaleDateString()}</div>
                      )}
                      {legalCase.caseFilingDate && (
                        <div>Filed: {new Date(legalCase.caseFilingDate).toLocaleDateString()}</div>
                      )}
                      {legalCase.nextHearingDate && (
                        <div className="text-blue-600 font-medium">
                          Next: {new Date(legalCase.nextHearingDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                      <button className="text-green-600 hover:text-green-900">Update</button>
                      <button className="text-purple-600 hover:text-purple-900">Notice</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {cases.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No legal cases found.
          </div>
        )}
      </div>
    </div>
  );
}