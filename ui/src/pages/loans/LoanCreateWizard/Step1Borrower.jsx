import React from 'react';

export default function Step1Borrower({ formData, setFormData, borrowers }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Select Borrower</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Borrower</label>
        <select
          value={formData.borrowerId}
          onChange={(e) => setFormData({ ...formData, borrowerId: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="">Select borrower</option>
          {borrowers.map(b => (
            <option key={b._id} value={b._id}>{b.name} - {b.phone}</option>
          ))}
        </select>
      </div>
    </div>
  );
}