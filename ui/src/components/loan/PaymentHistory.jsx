// ui/src/components/loan/PaymentHistory.jsx
import React from "react";

export default function PaymentHistory({ payments = [] }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-medium mb-2">Payment History</h3>
      <div className="overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs text-gray-500">Date</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500">Amount</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500">Breakup</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500">Mode</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500">Agent</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{new Date(p.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">₹{p.amount}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{`P:${p.principal || 0} I:${p.interest || 0} Pen:${p.penalty || 0}`}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">{p.mode}</span>
                </td>
                <td className="px-4 py-3">{p.collectedBy}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No payments recorded</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}