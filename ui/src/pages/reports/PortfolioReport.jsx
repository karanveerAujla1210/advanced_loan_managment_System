import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import ReportWrapper from './ReportWrapper';
import reportApi from '../../services/report.api';
import KpiCard from '../../components/ui/KpiCard';

export default function PortfolioReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ branch: '', from: '', to: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const result = await reportApi.fetchPortfolio(filters);
      setData(result);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    } finally {
      setLoading(false);
    }
  }

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
      title="Portfolio Summary Report"
      filters={filtersComponent}
      loading={loading}
      onExportXlsx={() => reportApi.exportXlsx('portfolio', filters)}
      onExportCsv={() => reportApi.exportCsv('portfolio', filters)}
      onExportPdf={() => reportApi.exportPdf('portfolio', filters)}
    >
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Loans"
            value={data.totalLoans?.toLocaleString() || '0'}
            icon={Target}
            color="blue"
          />
          
          <KpiCard
            title="Disbursed Amount"
            value={`₹${((data.disbursedAmount || 0) / 10000000).toFixed(1)}Cr`}
            icon={DollarSign}
            color="green"
          />
          
          <KpiCard
            title="Outstanding"
            value={`₹${((data.outstanding || 0) / 100000).toFixed(1)}L`}
            icon={TrendingUp}
            color="yellow"
          />
          
          <KpiCard
            title="PAR Accounts"
            value={data.parCounts?.toString() || '0'}
            icon={AlertTriangle}
            color="red"
          />
        </div>
      )}
    </ReportWrapper>
  );
}