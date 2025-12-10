import { useEffect, useState } from 'react';
import ReportWrapper from './ReportWrapper';
import reportApi from '../../services/report.api';
import DataTable from '../../components/ui/DataTable';

export default function AgentReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ branch: '', from: '', to: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const result = await reportApi.fetchAgentPerformance(filters);
      setData(result);
    } catch (error) {
      console.error('Failed to load agent data:', error);
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
      label: 'Average per Transaction',
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

  return (
    <ReportWrapper
      title="Agent Performance Report"
      filters={filtersComponent}
      loading={loading}
      onExportXlsx={() => reportApi.exportXlsx('agents', filters)}
      onExportCsv={() => reportApi.exportCsv('agents', filters)}
      onExportPdf={() => reportApi.exportPdf('agents', filters)}
    >
      <DataTable
        data={data}
        columns={columns}
        searchable={true}
        exportable={true}
      />
    </ReportWrapper>
  );
}