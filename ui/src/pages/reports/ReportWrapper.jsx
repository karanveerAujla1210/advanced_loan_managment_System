import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, Calendar } from 'lucide-react';

export default function ReportWrapper({ 
  title, 
  filters, 
  children, 
  onExportXlsx, 
  onExportCsv, 
  onExportPdf,
  loading = false 
}) {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">Generate and export comprehensive reports</p>
        </div>
        
        <div className="flex gap-2">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExportXlsx} 
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExportCsv} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <FileText className="h-4 w-4" />
            CSV
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExportPdf} 
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
          >
            <Download className="h-4 w-4" />
            PDF
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border"
      >
        {filters && (
          <div className="p-6 border-b bg-gray-50 rounded-t-xl">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
            {filters}
          </div>
        )}
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading report data...</span>
            </div>
          ) : (
            children
          )}
        </div>
      </motion.div>
    </div>
  );
}