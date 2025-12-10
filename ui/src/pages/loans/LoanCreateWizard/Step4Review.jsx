import React from 'react';

export default function Step4Review({ formData, borrower, product }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
      <div className="bg-gray-50 p-4 rounded space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">Borrower:</span>
          <span>{borrower?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Product:</span>
          <span>{product?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Amount:</span>
          <span>₹{formData.amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Tenure:</span>
          <span>{formData.tenure} months</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Interest Rate:</span>
          <span>{product?.interestRate}%</span>
        </div>
      </div>
    </div>
  );
}
