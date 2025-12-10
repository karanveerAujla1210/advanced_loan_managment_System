import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, FileText, Users, CreditCard, DollarSign, Gavel, Calendar } from 'lucide-react';
import reportApi from '../../services/report.api';

export default function ExportCenter() {
  const exportOptions = [
    {
      id: 'borrowers',
      title: 'Borrowers',
      description: 'Complete borrower database with KYC details',
      icon: Users,
      color: 'blue',
      count: '1,234'
    },
    {
      id: 'loans',
      title: 'Loans',
      description: 'All loan accounts with terms and status',
      icon: CreditCard,
      color: 'green',
      count: '856'
    },
    {
      id: 'payments',
      title: 'Payments',
      description: 'Payment transactions and collection history',
      icon: DollarSign,
      color: 'purple',
      count: '5,678'
    },
    {
      id: 'instalments',
      title: 'Instalments',
      description: 'EMI schedules and payment status',
      icon: Calendar,
      color: 'orange',
      count: '12,345'
    },
    {
      id: 'legal',
      title: 'Legal Cases',
      description: 'Legal proceedings and recovery cases',
      icon: Gavel,
      color: 'red',
      count: '23'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Center</h1>
        <p className="text-gray-600">Download comprehensive data exports in multiple formats</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exportOptions.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${getColorClasses(option.color)}`}>
                  <option.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{option.count}</p>
                  <p className="text-xs text-gray-500">records</p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{option.description}</p>
              
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => reportApi.exportXlsx(option.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => reportApi.exportCsv(option.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <FileText className="h-4 w-4" />
                  CSV
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => reportApi.exportPdf(option.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bulk Export Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Bulk Export</h3>
            <p className="text-gray-300">Export all data types in a single archive</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <Download className="h-5 w-5" />
            Download All
          </motion.button>
        </div>
      </motion.div>

      {/* Export History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border"
      >
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Exports</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[
              { file: 'borrowers_2024-01-15.xlsx', time: '2 hours ago', size: '2.3 MB' },
              { file: 'loans_2024-01-15.csv', time: '5 hours ago', size: '1.8 MB' },
              { file: 'payments_2024-01-14.xlsx', time: '1 day ago', size: '5.2 MB' }
            ].map((export_, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{export_.file}</p>
                    <p className="text-sm text-gray-500">{export_.time} • {export_.size}</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}