import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardCard from "../../components/ui/DashboardCard";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import api from "../../services/api";

export default function DisbursementQueue() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [disbursementModal, setDisbursementModal] = useState(false);
  const [disbursing, setDisbursing] = useState(false);

  useEffect(() => {
    fetchDisbursementQueue();
  }, []);

  async function fetchDisbursementQueue() {
    setLoading(true);
    try {
      const response = await api.get("/loans", { 
        params: { status: "APPROVED" } 
      });
      setLoans(response.data || []);
    } catch (error) {
      console.error("Error fetching disbursement queue:", error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisburse(loanId) {
    setDisbursing(true);
    try {
      await api.post(`/loans/${loanId}/disburse`, {
        disbursementDate: new Date().toISOString(),
        disbursementMethod: "BANK_TRANSFER",
        remarks: "Disbursed through system"
      });
      
      setDisbursementModal(false);
      setSelectedLoan(null);
      fetchDisbursementQueue();
    } catch (error) {
      console.error("Error disbursing loan:", error);
    } finally {
      setDisbursing(false);
    }
  }

  const columns = [
    {
      key: "loanNumber",
      header: "Loan Number",
      render: (value) => (
        <span className="font-medium text-primary">{value}</span>
      )
    },
    {
      key: "borrower",
      header: "Borrower",
      render: (value, row) => (
        <div>
          <div className="font-medium">{row.borrower?.firstName} {row.borrower?.lastName}</div>
          <div className="text-sm text-gray-500">{row.borrower?.phone}</div>
        </div>
      )
    },
    {
      key: "principalAmount",
      header: "Amount",
      render: (value) => (
        <span className="font-medium">₹ {value?.toLocaleString()}</span>
      )
    },
    {
      key: "loanProduct",
      header: "Product",
      render: (value, row) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {row.loanProduct?.name}
        </span>
      )
    },
    {
      key: "tenure",
      header: "Tenure",
      render: (value) => `${value} months`
    },
    {
      key: "emiAmount",
      header: "EMI",
      render: (value) => `₹ ${value?.toLocaleString()}`
    },
    {
      key: "applicationDate",
      header: "Applied On",
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (value, row) => (
        <Button
          size="sm"
          onClick={() => {
            setSelectedLoan(row);
            setDisbursementModal(true);
          }}
        >
          Disburse
        </Button>
      )
    }
  ];

  const stats = {
    totalPending: loans.length,
    totalAmount: loans.reduce((sum, loan) => sum + (loan.principalAmount || 0), 0),
    avgAmount: loans.length > 0 ? Math.round(loans.reduce((sum, loan) => sum + (loan.principalAmount || 0), 0) / loans.length) : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Disbursement Queue</h1>
          <p className="text-gray-600">Manage approved loans ready for disbursement</p>
        </div>
        <Button onClick={fetchDisbursementQueue}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard
          title="Pending Disbursements"
          value={stats.totalPending}
          icon="📋"
          loading={loading}
        />
        <DashboardCard
          title="Total Amount"
          value={`₹ ${stats.totalAmount.toLocaleString()}`}
          icon="💰"
          loading={loading}
        />
        <DashboardCard
          title="Average Amount"
          value={`₹ ${stats.avgAmount.toLocaleString()}`}
          icon="📊"
          loading={loading}
        />
      </div>

      {/* Disbursement Queue Table */}
      <Table
        columns={columns}
        data={loans}
        loading={loading}
        emptyMessage="No loans pending for disbursement"
        emptyIcon="✅"
        onRowClick={(loan) => {
          setSelectedLoan(loan);
          setDisbursementModal(true);
        }}
      />

      {/* Disbursement Modal */}
      <Modal
        isOpen={disbursementModal}
        onClose={() => {
          setDisbursementModal(false);
          setSelectedLoan(null);
        }}
        title="Confirm Disbursement"
        size="md"
      >
        {selectedLoan && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Loan Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Loan Number:</span>
                  <div className="font-medium">{selectedLoan.loanNumber}</div>
                </div>
                <div>
                  <span className="text-gray-600">Borrower:</span>
                  <div className="font-medium">
                    {selectedLoan.borrower?.firstName} {selectedLoan.borrower?.lastName}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <div className="font-medium">₹ {selectedLoan.principalAmount?.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">EMI:</span>
                  <div className="font-medium">₹ {selectedLoan.emiAmount?.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Tenure:</span>
                  <div className="font-medium">{selectedLoan.tenure} months</div>
                </div>
                <div>
                  <span className="text-gray-600">Interest Rate:</span>
                  <div className="font-medium">{selectedLoan.interestRate}%</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-3">⚠️</div>
                <div>
                  <h4 className="font-medium text-yellow-800">Disbursement Confirmation</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This action will disburse the loan amount and activate the loan account. 
                    The EMI schedule will be generated and the borrower will be notified.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                loading={disbursing}
                onClick={() => handleDisburse(selectedLoan._id)}
                className="flex-1"
              >
                {disbursing ? "Disbursing..." : "Confirm Disbursement"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDisbursementModal(false);
                  setSelectedLoan(null);
                }}
                disabled={disbursing}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}