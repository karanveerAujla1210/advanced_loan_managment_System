import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const LoanDetails = () => {
  const { loanId } = useParams();
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchLoanDetails();
  }, [loanId]);

  const fetchLoanDetails = async () => {
    try {
      const response = await api.get(`/loans/${loanId}/details`);
      setLoanData(response.data);
    } catch (error) {
      console.error('Error fetching loan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!loanData) {
    return <div className="text-center text-red-600">Loan not found</div>;
  }

  const { loan, schedule, payments, legal, charges, totals, nextDue, overdueInstalments, closingDetails, kpis } = loanData;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Loan Intelligence Panel</h1>
        <p className="text-gray-600">Complete loan analysis for {loan.borrower.name}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">Outstanding</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalOutstanding)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">Paid</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.totalPaid)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.overdueAmount)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-gray-500">DPD</h3>
          <p className="text-2xl font-bold text-gray-900">{kpis.maxDPD}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'schedule', 'payments', 'charges', 'legal'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Loan Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Loan Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Loan ID:</span>
                    <span className="font-medium">{loan._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product:</span>
                    <span className="font-medium">{loan.product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Principal:</span>
                    <span className="font-medium">{formatCurrency(loan.principal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest:</span>
                    <span className="font-medium">{formatCurrency(loan.interestTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee:</span>
                    <span className="font-medium">{formatCurrency(loan.processingFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST:</span>
                    <span className="font-medium">{formatCurrency(loan.gstOnProcessingFee)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total Payable:</span>
                    <span className="font-semibold">{formatCurrency(loan.totalPayable)}</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Loan Age:</span>
                    <span className="font-medium">{kpis.loanAge} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion:</span>
                    <span className="font-medium">{kpis.completionPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining EMIs:</span>
                    <span className="font-medium">{kpis.remainingInstalments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PAR Bucket:</span>
                    <span className={`font-medium ${kpis.currentPARBucket === 'Current' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpis.currentPARBucket}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Due:</span>
                    <span className="font-medium">{nextDue ? formatDate(nextDue.dueDate) : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EMI #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penalty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Due</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DPD</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedule.map((inst) => (
                    <tr key={inst._id} className={inst.overdueDays > 0 ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inst.instalmentNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(inst.dueDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(inst.principalDue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(inst.interestDue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(inst.penalty)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(inst.totalDueWithPenalty)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inst.overdueDays}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          inst.status === 'paid' ? 'bg-green-100 text-green-800' :
                          inst.overdueDays > 0 ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {inst.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penalty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(payment.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(payment.principalPaid || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(payment.interestPaid || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(payment.penaltyPaid || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.mode || 'Cash'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.receivedBy || 'System'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'charges' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Charges Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Bounce Charges:</span>
                    <span className="font-medium">{formatCurrency(charges.bounce)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Field Visit:</span>
                    <span className="font-medium">{formatCurrency(charges.fieldVisit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Legal Charges:</span>
                    <span className="font-medium">{formatCurrency(charges.legal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing:</span>
                    <span className="font-medium">{formatCurrency(charges.processing)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Total Charges:</span>
                    <span className="font-semibold">{formatCurrency(charges.total)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Closing Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Remaining Principal:</span>
                    <span className="font-medium">{formatCurrency(closingDetails.remainingPrincipal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining Interest:</span>
                    <span className="font-medium">{formatCurrency(closingDetails.remainingInterest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Penalty:</span>
                    <span className="font-medium">{formatCurrency(closingDetails.totalPenalty)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>All Charges:</span>
                    <span className="font-medium">{formatCurrency(closingDetails.bounceCharges + closingDetails.legalCharges + closingDetails.fieldVisitCharges)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-lg">Closing Amount:</span>
                    <span className="font-semibold text-lg text-blue-600">{formatCurrency(closingDetails.totalClosingAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'legal' && (
            <div>
              {legal ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Legal Case Details</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Case ID:</span>
                        <span className="font-medium">{legal.caseId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Filing Date:</span>
                        <span className="font-medium">{legal.filingDate ? formatDate(legal.filingDate) : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-medium capitalize">{legal.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>One-time Fee:</span>
                        <span className="font-medium">{formatCurrency(legal.oneTimeFee)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Weekly Charge:</span>
                        <span className="font-medium">{formatCurrency(legal.weeklyChargeAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weeks Charged:</span>
                        <span className="font-medium">{legal.totalWeeksCharged}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Legal Charges:</span>
                        <span className="font-medium">{formatCurrency(legal.totalLegalCharges)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Hearing:</span>
                        <span className="font-medium">{legal.nextHearingDate ? formatDate(legal.nextHearingDate) : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No legal case initiated for this loan
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;