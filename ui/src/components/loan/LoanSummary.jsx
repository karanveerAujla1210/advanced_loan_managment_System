// ui/src/components/loan/LoanSummary.jsx
import React from "react";
import { motion } from "framer-motion";

export default function LoanSummary({ loan, totals, nextDue }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Borrower</div>
          <div className="text-lg font-semibold">{loan.borrower?.firstName} {loan.borrower?.lastName}</div>
          <div className="text-sm text-gray-500">{loan.borrower?.phone}</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="p-3 bg-gray-50 rounded">
            <div className="text-xs text-gray-500">Outstanding</div>
            <div className="text-xl font-bold">₹{totals?.totalOutstanding ?? loan.totalPayable}</div>
          </motion.div>

          <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="p-3 bg-gray-50 rounded">
            <div className="text-xs text-gray-500">Next Due</div>
            <div className="text-lg font-semibold">{nextDue ? new Date(nextDue.dueDate).toLocaleDateString() : "No due"}</div>
            <div className="text-sm text-gray-500">{nextDue ? `₹${nextDue.totalDue ?? nextDue.amount}` : ""}</div>
          </motion.div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div className="border p-3 rounded">
          <div className="text-xs text-gray-500">Principal</div>
          <div className="font-medium">₹{loan.principal}</div>
        </div>
        <div className="border p-3 rounded">
          <div className="text-xs text-gray-500">Processing Fee</div>
          <div className="font-medium">₹{loan.processingFee}</div>
          <div className="text-xs text-gray-400">GST ₹{loan.gstOnProcessingFee}</div>
        </div>
        <div className="border p-3 rounded">
          <div className="text-xs text-gray-500">Interest Total</div>
          <div className="font-medium">₹{loan.interestTotal ?? loan.totalInterest ?? loan.totalPayable - loan.principal}</div>
        </div>
        <div className="border p-3 rounded">
          <div className="text-xs text-gray-500">Status</div>
          <div className="font-medium">{loan.status}</div>
        </div>
      </div>
    </div>
  );
}