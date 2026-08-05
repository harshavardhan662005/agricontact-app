'use client';

import React, { useState } from 'react';

export type EscrowStatus = 'PENDING' | 'HELD_IN_ESCROW' | 'RELEASED' | 'DISPUTED';

interface EscrowStatusCardProps {
  contractId: string;
  totalAmount: number;
  initialStatus?: EscrowStatus;
  userRole: 'BUYER' | 'FARMER';
  onStatusChange?: (newStatus: EscrowStatus) => void;
}

export const EscrowStatusCard: React.FC<EscrowStatusCardProps> = ({
  contractId,
  totalAmount,
  initialStatus = 'PENDING',
  userRole,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<EscrowStatus>(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    setLoading(true);
    // Simulate API call to fund escrow
    setTimeout(() => {
      setStatus('HELD_IN_ESCROW');
      setLoading(false);
      onStatusChange?.('HELD_IN_ESCROW');
    }, 1000);
  };

  const handleRelease = async () => {
    setLoading(true);
    // Simulate API call to release escrow upon delivery
    setTimeout(() => {
      setStatus('RELEASED');
      setLoading(false);
      onStatusChange?.('RELEASED');
    }, 1000);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'HELD_IN_ESCROW':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">🔒 Held in Escrow</span>;
      case 'RELEASED':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">✅ Payment Released</span>;
      case 'DISPUTED':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">⚠️ Under Dispute</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">⏳ Payment Pending</span>;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Escrow Account</h3>
          <p className="text-xs text-gray-400">Contract ID: #{contractId}</p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="flex justify-between items-baseline">
        <span className="text-sm text-gray-600">Total Escrow Amount:</span>
        <span className="text-2xl font-bold text-gray-900">₹{totalAmount.toLocaleString()}</span>
      </div>

      {/* Action Buttons based on User Role & Status */}
      <div className="pt-2">
        {userRole === 'BUYER' && status === 'PENDING' && (
          <button
            onClick={handleDeposit}
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition text-sm shadow-sm disabled:opacity-50"
          >
            {loading ? 'Processing Deposit...' : 'Deposit Funds into Escrow'}
          </button>
        )}

        {userRole === 'BUYER' && status === 'HELD_IN_ESCROW' && (
          <button
            onClick={handleRelease}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition text-sm shadow-sm disabled:opacity-50"
          >
            {loading ? 'Releasing Funds...' : 'Confirm Delivery & Release Payment'}
          </button>
        )}

        {userRole === 'FARMER' && status === 'HELD_IN_ESCROW' && (
          <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-center">
            Funds are locked in escrow. They will be transferred to your account once the buyer confirms delivery.
          </p>
        )}

        {status === 'RELEASED' && (
          <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-center">
            Transaction complete! Funds have been disbursed.
          </p>
        )}
      </div>
    </div>
  );
};