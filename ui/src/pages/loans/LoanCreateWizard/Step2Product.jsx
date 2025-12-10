import React from 'react';

export default function Step2Product({ formData, setFormData, products }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Select Product</h2>
      <div>
        <label className="block text-sm font-medium mb-1">Loan Product</label>
        <select
          value={formData.productId}
          onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="">Select product</option>
          {products.map(p => (
            <option key={p._id} value={p._id}>{p.name} - {p.interestRate}%</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Loan Amount</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tenure (Months)</label>
        <input
          type="number"
          value={formData.tenure}
          onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
    </div>
  );
}
