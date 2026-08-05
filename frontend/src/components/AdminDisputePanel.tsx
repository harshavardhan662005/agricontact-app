'use client';

import React, { useState } from 'react';

interface DisputeItem {
  id: string;
  contractId: string;
  raisedBy: string;
  reason: string;
  amount: number;
  status: 'PENDING_REVIEW' | 'REFUNDED' | 'RELEASED_TO_FARMER';
}

export const AdminDisputePanel: React.FC = () => {
  const [disputes, setDisputes] = useState<DisputeItem[]>([
    {
      id: 'disp_101',
      contractId: 'contract_99',
      raisedBy: 'Buyer (buyer_001)',
      reason: '20% of tomatoes were damaged in transit.',
      amount: 17500,
      status: 'PENDING_REVIEW',
    },
  ]);

  const handleResolve = (id: string, action: 'REFUNDED' | 'RELEASED_TO_FARMER') => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: action } : d))
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="border-b pb-3">
        <h2 className="text-lg font-bold text-gray-900">🛡️ Admin Dispute Resolution Console</h2>
        <p className="text-xs text-gray-500">Review claims and override escrow releases</p>
      </div>

      {disputes.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No active disputes to review.</p>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="border border-gray-100 bg-gray-50 p-4 rounded-xl space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-red-100 text-red-700 rounded-md">
                    {dispute.status}
                  </span>
                  <p className="text-sm font-bold text-gray-800 mt-1">
                    Contract #{dispute.contractId} — ₹{dispute.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Raised by: {dispute.raisedBy}</p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm text-gray-700">
                <strong>Claim Details:</strong> "{dispute.reason}"
              </div>

              {dispute.status === 'PENDING_REVIEW' ? (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleResolve(dispute.id, 'REFUNDED')}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-xs transition"
                  >
                    Refund Buyer
                  </button>
                  <button
                    onClick={() => handleResolve(dispute.id, 'RELEASED_TO_FARMER')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs transition"
                  >
                    Release to Farmer
                  </button>
                </div>
              ) : (
                <p className="text-xs font-semibold text-gray-600">
                  Resolved: Escrow marked as {dispute.status}.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};