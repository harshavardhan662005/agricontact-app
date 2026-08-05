'use client';

import React, { useState } from 'react';
import { ContractsDashboard } from '../components/ContractBoard';
import { ProposeContractModal } from '../components/purposeContractModal';
import { EscrowStatusCard } from '../components/EscrowStatusCard';
import { DisputeModal } from '../components/DisputeModal';
import { AdminDisputePanel } from '../components/AdminDisputePanel';
import { ContractChatNotification } from '../components/ContractChatNotification';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [escrowStatus, setEscrowStatus] = useState<'PENDING' | 'HELD_IN_ESCROW' | 'RELEASED' | 'DISPUTED'>('HELD_IN_ESCROW');

  const sampleListing = {
    id: 'listing_101',
    title: 'Fresh Organic Tomatoes',
    pricePerKg: 35,
    availableQuantityKg: 500,
    farmerId: 'farmer_001',
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{sampleListing.title}</h2>
          <p className="text-sm text-gray-500">
            Available: {sampleListing.availableQuantityKg} kg • ₹{sampleListing.pricePerKg}/kg
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
        >
          Propose Agreement
        </button>
      </div>

      {/* Escrow Tracker with Dispute Trigger */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Active Escrow & Payment Tracking</h3>
          {escrowStatus === 'HELD_IN_ESCROW' && (
            <button
              onClick={() => setIsDisputeOpen(true)}
              className="text-xs text-red-600 hover:underline font-semibold"
            >
              Raise Dispute?
            </button>
          )}
        </div>

        <EscrowStatusCard
          contractId="contract_99"
          totalAmount={17500}
          initialStatus={escrowStatus}
          userRole="BUYER"
          onStatusChange={setEscrowStatus}
        />
      </div>

      {/* Phase 9: Messaging & Notifications */}
      <ContractChatNotification />

      {/* Admin Dispute Console */}
      <AdminDisputePanel />

      {/* Contracts Dashboard */}
      <ContractsDashboard />

      {/* Modals */}
      <ProposeContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listing={sampleListing}
        buyerId="buyer_001"
        onSuccess={() => window.location.reload()}
      />

      <DisputeModal
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
        contractId="contract_99"
        onDisputeSubmitted={() => setEscrowStatus('DISPUTED')}
      />
    </main>
  );
}