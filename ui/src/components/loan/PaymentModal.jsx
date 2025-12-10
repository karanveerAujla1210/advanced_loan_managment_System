// ui/src/components/loan/PaymentModal.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import loanApi from "../../services/loan.api";

export default function PaymentModal({ open, onClose, loan, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("CASH");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!amount || isNaN(amount)) {
      alert("Please enter valid amount");
      return;
    }
    
    setLoading(true);
    try {
      const payload = { amount: Number(amount), mode, note };
      await loanApi.postPayment(loan._id, payload);
      onSuccess && onSuccess();
    } catch (e) {
      console.error(e);
      alert("Payment failed: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-[520px] bg-white rounded p-4">
        <h3 className="text-lg font-semibold mb-4">Post Payment</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <input 
              type="number" 
              value={amount} 
              onChange={e=>setAmount(e.target.value)} 
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter payment amount"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <select value={mode} onChange={e=>setMode(e.target.value)} className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="CASH">Cash</option>
              <option value="NEFT">NEFT</option>
              <option value="UPI">UPI</option>
              <option value="CHEQUE">Cheque</option>
              <option value="RTGS">RTGS</option>
              <option value="IMPS">IMPS</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <input 
              value={note} 
              onChange={e=>setNote(e.target.value)} 
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Optional note or reference"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button 
              disabled={loading} 
              onClick={submit} 
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Payment"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}