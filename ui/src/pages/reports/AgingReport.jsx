import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';
import ReportWrapper from './ReportWrapper';
import reportApi from '../../services/report.api';
import DataTable from '../../components/ui/DataTable';

export default function AgingReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ branch: '', bucket: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const result = await reportApi.fetchAging(filters);
      setData(result);
    } catch (error) {
      console.error('Failed to load aging data:', error);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: 'loan', label: 'Loan ID', sortable: true },
    { 
      key: 'dueDate', 
      label: 'Due Date', 
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'dpd', 
      label: 'DPD', 
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value <= 7 ? 'bg-yellow-100 text-yellow-800' :
          value <= 30 ? 'bg-orange-100 text-orange-800' :
          value <= 60 ? 'bg-red-100 text-red-800' :
          'bg-red-200 text-red-900'
        }`}>
          {value} days
        </span>
      )
    },
    { 
      key: 'amount', 
      label: 'Amount Due', 
      sortable: true,
      render: (value) => `₹${value?.toLocaleString() || 0}`
    },
    { key: 'status', label: 'Status', sortable: true }
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
        <label className="block text-sm font-medium text-gray-700 mb-1">DPD Bucket</label>
        <select 
          value={filters.bucket} 
          onChange={(e) => setFilters({...filters, bucket: e.target.value})}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Buckets</option>
          <option value="1-7">1-7 Days</option>
          <option value="8-30">8-30 Days</option>
          <option value="31-60">31-60 Days</option>
          <option value="60+">60+ Days</option>
        </select>
      </div>
      
      <button 
        onClick={loadData}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );

  // Calculate bucket summaries
  const bucketSummary = data.reduce((acc, item) => {
    const dpd = item.dpd || 0;
    let bucket;
    if (dpd <= 7) bucket = '1-7';
    else if (dpd <= 30) bucket = '8-30';
    else if (dpd <= 60) bucket = '31-60';
    else bucket = '60+';
    
    if (!acc[bucket]) acc[bucket] = { count: 0, amount: 0 };
    acc[bucket].count++;
    acc[bucket].amount += item.amount || 0;
    return acc;
  }, {});

  return (
    <ReportWrapper
      title="Aging & DPD Analysis Report"
      filters={filtersComponent}
      loading={loading}
      onExportXlsx={() => reportApi.exportXlsx('instalments', filters)}
      onExportCsv={() => reportApi.exportCsv('instalments', filters)}
      onExportPdf={() => reportApi.exportPdf('instalments', filters)}
    >
      <div className="space-y-6">
        {/* Bucket Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(bucketSummary).map(([bucket, summary], index) => (
            <motion.div
              key={bucket}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border-2 ${
                bucket === '1-7' ? 'bg-yellow-50 border-yellow-200' :
                bucket === '8-30' ? 'bg-orange-50 border-orange-200' :
                bucket === '31-60' ? 'bg-red-50 border-red-200' :
                'bg-red-100 border-red-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{bucket} Days</h3>
                {bucket === '60+' ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Count: {summary.count}</p>
                <p className="text-lg font-bold">₹{summary.amount.toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Aging Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Aging Distribution</h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Aging chart visualization would go here</p>
          </div>
        </motion.div>

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