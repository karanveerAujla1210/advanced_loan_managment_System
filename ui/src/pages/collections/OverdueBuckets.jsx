import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Phone, MapPin, User } from 'lucide-react';
import api from '../../services/api';

export default function OverdueBuckets() {
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [buckets, setBuckets] = useState({});
  const [selectedBucket, setSelectedBucket] = useState('1-7');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverdueLoans();
  }, []);

  const fetchOverdueLoans = async () => {
    try {
      const response = await api.get('/loans?status=ACTIVE&overdue=true');
      const loans = response.data;
      setOverdueLoans(loans);
      
      // Group loans by DPD buckets
      const bucketData = {
        '1-7': loans.filter(l => l.dpd >= 1 && l.dpd <= 7),
        '8-30': loans.filter(l => l.dpd >= 8 && l.dpd <= 30),
        '31-60': loans.filter(l => l.dpd >= 31 && l.dpd <= 60),
        '61-90': loans.filter(l => l.dpd >= 61 && l.dpd <= 90),
        '90+': loans.filter(l => l.dpd > 90)
      };
      setBuckets(bucketData);
    } catch (error) {
      console.error('Error fetching overdue loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBucketColor = (bucket) => {
    switch (bucket) {
      case '1-7': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '8-30': return 'bg-orange-100 text-orange-800 border-orange-200';
      case '31-60': return 'bg-red-100 text-red-800 border-red-200';
      case '61-90': return 'bg-purple-100 text-purple-800 border-purple-200';
      case '90+': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalOverdueAmount = overdueLoans.reduce((sum, loan) => sum + (loan.overdueAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Overdue Buckets</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <AlertTriangle className="h-4 w-4" />
          Total Overdue: ₹{totalOverdueAmount.toLocaleString()}
        </div>
      </div>

      {/* Bucket Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(buckets).map(([bucket, loans]) => (
          <motion.div
            key={bucket}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedBucket(bucket)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedBucket === bucket 
                ? getBucketColor(bucket) + ' ring-2 ring-blue-500' 
                : getBucketColor(bucket) + ' hover:shadow-md'
            }`}
          >
            <div className="text-center">
              <p className="text-sm font-medium">{bucket} Days</p>
              <p className="text-2xl font-bold mt-1">{loans.length}</p>
              <p className="text-xs mt-1">
                ₹{loans.reduce((sum, l) => sum + (l.overdueAmount || 0), 0).toLocaleString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Bucket Details */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedBucket} Days Overdue ({buckets[selectedBucket]?.length || 0} loans)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DPD</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(buckets[selectedBucket] || []).map((loan) => (
                <motion.tr
                  key={loan._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{loan.loanId}</div>
                      <div className="text-sm text-gray-500">{loan.loanProduct?.name}</div>
                      <div className="text-sm text-gray-500">₹{loan.outstanding?.toLocaleString()} outstanding</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{loan.borrower?.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {loan.borrower?.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      loan.dpd <= 7 ? 'bg-yellow-100 text-yellow-800' :
                      loan.dpd <= 30 ? 'bg-orange-100 text-orange-800' :
                      loan.dpd <= 90 ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {loan.dpd} days
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-semibold text-red-600">
                      ₹{(loan.overdueAmount || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loan.lastPaymentDate ? new Date(loan.lastPaymentDate).toLocaleDateString() : 'No payments'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Call
                      </button>
                      <button className="text-green-600 hover:text-green-900 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Visit
                      </button>
                      <CollectionModal loan={loan} onUpdate={fetchOverdueLoans} />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {(buckets[selectedBucket]?.length || 0) === 0 && (
          <div className="text-center py-8 text-gray-500">
            No loans in this bucket.
          </div>
        )}
      </div>
    </div>
  );
}

function CollectionModal({ loan, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMode: 'CASH',
    remarks: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', {
        loan: loan._id,
        borrower: loan.borrower._id,
        amount: parseFloat(formData.amount),
        paymentMode: formData.paymentMode,
        paymentDate: formData.paymentDate,
        remarks: formData.remarks
      });
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-purple-600 hover:text-purple-900"
      >
        Collect
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Payment</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan ID</label>
                <p className="text-gray-900 font-medium">{loan.loanId}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overdue Amount</label>
                <p className="text-red-600 font-medium">₹{(loan.overdueAmount || 0).toLocaleString()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="ONLINE">Online Transfer</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  required
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Optional remarks"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}