import React from 'react';

export default function Step3Schedule({ schedule }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">EMI Schedule</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">No</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Due Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">EMI</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Principal</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Interest</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Balance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedule.map((inst, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2 text-sm">{inst.instalmentNo}</td>
                <td className="px-4 py-2 text-sm">{new Date(inst.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-sm">₹{inst.emi}</td>
                <td className="px-4 py-2 text-sm">₹{inst.principal}</td>
                <td className="px-4 py-2 text-sm">₹{inst.interest}</td>
                <td className="px-4 py-2 text-sm">₹{inst.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
