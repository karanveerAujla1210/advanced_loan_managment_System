import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import PaymentForm from '../../components/forms/PaymentForm';
import { DollarSign, Calendar, User, Phone } from 'lucide-react';

export default function SimpleCollections() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    fetchDueLoans();
  }, []);

  const fetchDueLoans = async () => {
    try {
      const response = await fetch('/api/loans?status=DISBURSED', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setLoans(data.loans || []);
    } catch (error) {
      toast.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (payment) => {
    setShowPaymentForm(false);
    setSelectedLoan(null);
    fetchDueLoans(); // Refresh the list
    toast.success('Payment recorded successfully!');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showPaymentForm && selectedLoan) {
    return (
      <div className="p-6">
        <PaymentForm
          loanId={selectedLoan._id}
          onSuccess={handlePaymentSuccess}
          onCancel={() => {
            setShowPaymentForm(false);
            setSelectedLoan(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
        <p className="text-gray-600">Manage loan payments and collections</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Active Loans</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {loans.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No active loans found
            </div>
          ) : (
            loans.map((loan) => (
              <div key={loan._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {loan.borrower?.personalInfo?.firstName} {loan.borrower?.personalInfo?.lastName}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {loan.loanId}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Principal: ₹{loan.principal?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>EMI: ₹{loan.emi?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Tenure: {loan.tenure} months</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{loan.borrower?.contact?.phone}</span>
                      </div>
                    </div>
                    
                    {loan.totalPaid > 0 && (
                      <div className="mt-2 text-sm text-green-600">
                        Total Paid: ₹{loan.totalPaid.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <Button
                      onClick={() => {
                        setSelectedLoan(loan);
                        setShowPaymentForm(true);
                      }}
                      size="sm"
                    >
                      Record Payment
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}