import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, TrendingUp } from 'lucide-react';
import ReportWrapper from './ReportWrapper';
import reportApi from '../../services/report.api';
import DataTable from '../../components/ui/DataTable';

export default function CollectionReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ branch: '', from: '', to: '', agent: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const result = await reportApi.fetchCollections(filters);
      setData(result);
    } catch (error) {
      console.error('Failed to load collection data:', error);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: '_id', label: 'Agent', sortable: true },
    { 
      key: 'total', 
      label: 'Total Collected', 
      sortable: true,
      render: (value) => `₹${value?.toLocaleString() || 0}`
    },
    { key: 'count', label: 'Transactions', sortable: true },
    {
      key: 'average',
      label: 'Average',
      render: (_, row) => `₹${Math.round((row.total || 0) / (row.count || 1)).toLocaleString()}`
    }
  ];

  const filtersComponent = (
    <div className="flex gap-4 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
        <select 
          value={filters.branch} 
          onChange={(e) => setFilters({...filters, branch: e.target.value})}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Branches</option>
          <option value="BR001">Main Branch</option>
          <option value="BR002">North Branch</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
        <select 
          value={filters.agent} 
          onChange={(e) => setFilters({...filters, agent: e.target.value})}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Agents</option>
          <option value="AGT001">Agent 1</option>
          <option value="AGT002">Agent 2</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
        <input 
          type="date" 
          value={filters.from}
          onChange={(e) => setFilters({...filters, from: e.target.value})}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
        <input 
          type="date" 
          value={filters.to}
          onChange={(e) => setFilters({...filters, to: e.target.value})}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <button 
        onClick={loadData}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );

  const totalCollected = data.reduce((sum, item) => sum + (item.total || 0), 0);
  const totalTransactions = data.reduce((sum, item) => sum + (item.count || 0), 0);

  return (
    <ReportWrapper
      title="Collection Performance Report"
      filters={filtersComponent}
      loading={loading}
      onExportXlsx={() => reportApi.exportXlsx('collections', filters)}
      onExportCsv={() => reportApi.exportCsv('collections', filters)}
      onExportPdf={() => reportApi.exportPdf('collections', filters)}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Collected</p>
                <p className="text-2xl font-bold">₹{totalCollected.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Active Agents</p>
                <p className="text-2xl font-bold">{data.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </motion.div>
        </div>

        {/* Data Table */}
        <DataTable
          data={data}
          columns={columns}
          searchable={true}
          exportable={true}
          className="shadow-lg"
        />
      </div>
    </ReportWrapper>
  );
}