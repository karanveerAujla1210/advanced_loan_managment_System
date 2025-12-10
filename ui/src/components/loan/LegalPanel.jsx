// ui/src/components/loan/LegalPanel.jsx
import React, { useState } from "react";
import loanApi from "../../services/loan.api";

export default function LegalPanel({ loan, onLegalAction }) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  const escalate = async () => {
    if (!confirm("Escalate to legal? This will apply legal charges and create a legal case.")) return;
    
    setLoading(true);
    try {
      await loanApi.triggerLegal(loan._id, { note });
      onLegalAction && onLegalAction();
      alert("Legal case created successfully.");
      setNote("");
    } catch (e) {
      console.error(e); 
      alert("Failed to create legal case: " + (e.response?.data?.message || e.message));
    } finally { 
      setLoading(false); 
    }
  };

  const legalStatus = loan.legal?.status || "No legal case";
  const isLegalActive = loan.legal?.status && loan.legal.status !== "closed";

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-medium mb-3">Legal Actions</h3>
      
      <div className="mb-3">
        <div className="text-sm text-gray-600 mb-1">Current Status:</div>
        <span className={`px-2 py-1 rounded text-xs ${isLegalActive ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"}`}>
          {legalStatus}
        </span>
      </div>

      {loan.legal?.caseDate && (
        <div className="text-sm text-gray-600 mb-3">
          Case Date: {new Date(loan.legal.caseDate).toLocaleDateString()}
        </div>
      )}
      
      <textarea 
        placeholder="Legal note or reason for escalation" 
        value={note} 
        onChange={(e)=>setNote(e.target.value)} 
        className="w-full border rounded p-2 mb-3 text-sm" 
        rows="3"
      />
      
      <div className="flex gap-2">
        <button 
          onClick={escalate} 
          className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-sm" 
          disabled={loading || isLegalActive}
        >
          {loading ? "Processing..." : "Escalate to Legal"}
        </button>
        
        <button 
          onClick={() => alert(JSON.stringify(loan.legal || {}, null, 2))} 
          className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
        >
          View Details
        </button>
      </div>

      {isLegalActive && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          ⚠️ Legal case is active. Contact legal team for updates.
        </div>
      )}
    </div>
  );
}