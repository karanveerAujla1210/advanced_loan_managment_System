import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, CreditCard, FileText, Edit, Save, X } from 'lucide-react';
import api from '../../services/api';

export default function BorrowerProfile() {
  const { id } = useParams();
  const [borrower, setBorrower] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchBorrower();
    fetchLoans();
  }, [id]);

  const fetchBorrower = async () => {
    try {
      const response = await api.get(`/borrowers/${id}`);
      setBorrower(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching borrower:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoans = async () => {
    try {
      const response = await api.get(`/loans?borrower=${id}`);
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/borrowers/${id}`, formData);
      setBorrower(formData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating borrower:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Borrower Profile</h2>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Save className="h-4 w-4" /> Save
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2">
                <X className="h-4 w-4" /> Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Edit className="h-4 w-4" /> Edit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{borrower?.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{borrower?.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{borrower?.email || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar</label>
                <p className="text-gray-900">{borrower?.aadhaar || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN</label>
                <p className="text-gray-900">{borrower?.pan || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  borrower?.kycStatus === 'COMPLETE' ? 'bg-green-100 text-green-800' :
                  borrower?.kycStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {borrower?.kycStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Loans</span>
                <span className="font-semibold">{loans.filter(l => l.status === 'ACTIVE').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Exposure</span>
                <span className="font-semibold">₹{loans.reduce((sum, l) => sum + (l.outstanding || 0), 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  borrower?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  borrower?.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {borrower?.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loans */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Loan History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DPD</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans.map((loan) => (
                <tr key={loan._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loan.loanId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{loan.loanProduct?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{loan.principal?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{loan.outstanding?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      loan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      loan.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={loan.dpd > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                      {loan.dpd || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}