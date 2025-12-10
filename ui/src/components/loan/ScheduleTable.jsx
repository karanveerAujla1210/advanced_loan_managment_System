// ui/src/components/loan/ScheduleTable.jsx
import React from "react";

export default function ScheduleTable({ schedule = [] }) {
  return (
    <div className="bg-white rounded shadow overflow-auto">
      <div className="p-4 border-b">
        <h3 className="font-medium">EMI Schedule</h3>
      </div>
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs text-gray-500">#</th>
            <th className="px-4 py-2 text-left text-xs text-gray-500">Due Date</th>
            <th className="px-4 py-2 text-right text-xs text-gray-500">Principal</th>
            <th className="px-4 py-2 text-right text-xs text-gray-500">Interest</th>
            <th className="px-4 py-2 text-right text-xs text-gray-500">Penalty</th>
            <th className="px-4 py-2 text-right text-xs text-gray-500">Total</th>
            <th className="px-4 py-2 text-center text-xs text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map(row => (
            <tr key={row.installmentNo} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">{row.installmentNo}</td>
              <td className="px-4 py-3">{new Date(row.dueDate).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-right">₹{row.principalComponent ?? row.principalDue ?? "-"}</td>
              <td className="px-4 py-3 text-right">₹{row.interestComponent ?? row.interestDue ?? "-"}</td>
              <td className="px-4 py-3 text-right">₹{row.penalty ?? row.penaltyDue ?? 0}</td>
              <td className="px-4 py-3 text-right font-medium">₹{row.amount ?? row.totalDue}</td>
              <td className="px-4 py-3 text-center">
                <span className={`px-2 py-1 rounded text-xs ${row.status === "paid" ? "bg-emerald-100 text-emerald-800" : row.status === "overdue" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-800"}`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}