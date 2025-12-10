import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Drawer from "../../components/ui/Drawer";
import api from "../../services/api";

export default function DailyCollections() {
  const [collections, setCollections] = useState({
    today: [],
    overdue1to7: [],
    overdue8to30: [],
    overdue31to60: [],
    overdue60plus: []
  });
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections() {
    try {
      const response = await api.get("/collections/daily-board");
      setCollections(response.data);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  }

  const openPaymentDrawer = (loan) => {
    setSelectedLoan(loan);
    setPaymentDrawerOpen(true);
  };

  const CollectionCard = ({ loan, bucketType }) => {
    const getRiskColor = (score) => {
      if (score >= 80) return "bg-red-100 text-red-800";
      if (score >= 60) return "bg-yellow-100 text-yellow-800";
      return "bg-green-100 text-green-800";
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-white p-3 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => openPaymentDrawer(loan)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="font-medium text-gray-900 text-sm">
              {loan.borrower?.firstName} {loan.borrower?.lastName}
            </div>
            <div className="text-xs text-gray-500">#{loan.loanNumber}</div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(loan.riskScore || 50)}`}>
            {loan.riskScore || 50}
          </span>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Due Amount:</span>
            <span className="font-medium">₹ {loan.dueAmount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Phone:</span>
            <span className="text-blue-600">{loan.borrower?.phone}</span>
          </div>
          {bucketType !== 'today' && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Days Overdue:</span>
              <span className="text-red-600 font-medium">{loan.daysOverdue}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const CollectionColumn = ({ title, loans, bucketType, bgColor = "bg-gray-50" }) => (
    <div className={`${bgColor} rounded-lg p-4 min-h-96`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
          {loans.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="bg-white p-3 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : loans.length > 0 ? (
          loans.map(loan => (
            <CollectionCard key={loan._id} loan={loan} bucketType={bucketType} />
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-sm">No collections</div>
          </div>
        )}
      </div>
    </div>
  );

  const QuickPaymentForm = () => {
    const [paymentData, setPaymentData] = useState({
      amount: selectedLoan?.dueAmount || 0,
      paymentMode: "cash",
      remarks: ""
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await api.post(`/payments`, {
          loanId: selectedLoan._id,
          ...paymentData
        });
        setPaymentDrawerOpen(false);
        fetchCollections(); // Refresh data
      } catch (error) {
        console.error("Payment error:", error);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Amount
          </label>
          <input
            type="number"
            value={paymentData.amount}
            onChange={(e) => setPaymentData({...paymentData, amount: Number(e.target.value)})}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Mode
          </label>
          <select
            value={paymentData.paymentMode}
            onChange={(e) => setPaymentData({...paymentData, paymentMode: e.target.value})}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="upi">UPI</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks
          </label>
          <textarea
            value={paymentData.remarks}
            onChange={(e) => setPaymentData({...paymentData, remarks: e.target.value})}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
            rows="3"
          />
        </div>

        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary focus:ring-opacity-20"
          >
            Record Payment
          </motion.button>
          <button
            type="button"
            onClick={() => setPaymentDrawerOpen(false)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Daily Collections</h1>
          <p className="text-gray-600">Manage payments and follow-ups</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={fetchCollections}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary focus:ring-opacity-20"
        >
          Refresh
        </motion.button>
      </div>

      {/* Collection Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto">
        <CollectionColumn
          title="Today Due"
          loans={collections.today}
          bucketType="today"
          bgColor="bg-blue-50"
        />
        <CollectionColumn
          title="1-7 Days"
          loans={collections.overdue1to7}
          bucketType="1-7"
          bgColor="bg-yellow-50"
        />
        <CollectionColumn
          title="8-30 Days"
          loans={collections.overdue8to30}
          bucketType="8-30"
          bgColor="bg-orange-50"
        />
        <CollectionColumn
          title="31-60 Days"
          loans={collections.overdue31to60}
          bucketType="31-60"
          bgColor="bg-red-50"
        />
        <CollectionColumn
          title="60+ Days"
          loans={collections.overdue60plus}
          bucketType="60+"
          bgColor="bg-red-100"
        />
      </div>

      {/* Quick Payment Drawer */}
      <Drawer
        isOpen={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        title={`Quick Payment - ${selectedLoan?.borrower?.firstName} ${selectedLoan?.borrower?.lastName}`}
        size="md"
      >
        {selectedLoan && (
          <div className="space-y-4">
            {/* Loan Details */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Loan Details</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Loan Number:</span>
                  <span className="font-medium">{selectedLoan.loanNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Amount:</span>
                  <span className="font-medium text-red-600">₹ {selectedLoan.dueAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="font-medium">{selectedLoan.borrower?.phone}</span>
                </div>
              </div>
            </div>

            <QuickPaymentForm />
          </div>
        )}
      </Drawer>
    </div>
  );
}