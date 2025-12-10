// ui/src/pages/loan/LoanDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import loanApi from "../../services/loan.api";
import LoanSummary from "../../components/loan/LoanSummary";
import ScheduleTable from "../../components/loan/ScheduleTable";
import PaymentHistory from "../../components/loan/PaymentHistory";
import PaymentModal from "../../components/loan/PaymentModal";
import LegalPanel from "../../components/loan/LegalPanel";

export default function LoanDetailsPage() {
  const { loanId } = useParams();
  const [loanDetails, setLoanDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await loanApi.fetchLoanDetails(loanId);
      setLoanDetails(data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [loanId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!loanDetails) return <div className="p-6">Loan not found</div>;

  const { loan, schedule, payments, totals, nextDue } = loanDetails;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start gap-4">
        <motion.h1 initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="text-2xl font-bold">
          Loan • {loan._id}
        </motion.h1>

        <div className="flex gap-2">
          <button onClick={() => loanApi.downloadLoanPdf(loan._id)} className="px-3 py-2 rounded bg-gray-100">Download Statement (PDF)</button>
          <button onClick={() => setPaymentModalOpen(true)} className="px-3 py-2 rounded bg-primary text-white">Post Payment</button>
        </div>
      </div>

      <LoanSummary loan={loan} totals={totals} nextDue={nextDue} />

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <ScheduleTable schedule={schedule} />
          <PaymentHistory payments={payments} />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded shadow p-4">
            <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <button onClick={() => loanApi.downloadLoanPdf(loan._id)} className="w-full px-3 py-2 rounded bg-blue-600 text-white">Download Statement (Server PDF)</button>
              <button onClick={() => setPaymentModalOpen(true)} className="w-full px-3 py-2 rounded bg-emerald-600 text-white">Record Payment</button>
              <button onClick={() => alert('Open top-up drawer (not implemented)')} className="w-full px-3 py-2 rounded bg-yellow-100">Top-up</button>
            </div>
          </div>

          <LegalPanel loan={loan} onLegalAction={load} />
        </div>
      </div>

      <PaymentModal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} loan={loan} onSuccess={() => { setPaymentModalOpen(false); load(); }} />
    </div>
  );
}