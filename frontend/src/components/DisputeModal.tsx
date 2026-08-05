'use client';

import React, { useState } from 'react';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  onDisputeSubmitted: (reason: string) => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  contractId,
  onDisputeSubmitted,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    // Simulate API call to register dispute
    setTimeout(() => {
      setLoading(false);
      onDisputeSubmitted(reason);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
            ⚠️ Raise Contract Dispute
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Contract ID: #{contractId}. Raising a dispute will pause escrow disbursement until an admin conducts a manual review.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Dispute
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide details (e.g., damaged goods, quantity shortage, delayed shipment)..."
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};