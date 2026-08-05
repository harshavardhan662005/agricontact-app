import React, { useEffect, useState } from 'react';
import { contractService } from '../services/contractservice';
export interface Contract {
  id: string;
  listingId: string;
  agreedQuantityKg: number;
  agreedPricePerKg: number;
  deliveryDate: string;
  status: 'PROPOSED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  listing?: { title?: string; cropType?: string };
  buyer?: { id: string; name: string; phone?: string };
  farmer?: { id: string; name: string; phone?: string };
}

export const ContractsDashboard: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contractService.getAllContracts();
      setContracts(response.contracts || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load contracts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleStatusUpdate = async (contractId: string, newStatus: string) => {
    try {
      await contractService.updateContractStatus(contractId, newStatus);
      // Refresh list to reflect updated status
      fetchContracts();
    } catch (err: any) {
      alert(`Error updating contract: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PROPOSED: 'bg-amber-100 text-amber-800 border-amber-300',
      ACCEPTED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      REJECTED: 'bg-rose-100 text-rose-800 border-rose-300',
      COMPLETED: 'bg-blue-100 text-blue-800 border-blue-300',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full border ${
          styles[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500 font-medium">Loading contracts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AgriContact Contracts</h1>
          <p className="text-sm text-gray-500">Manage agricultural supply agreements and status updates.</p>
        </div>
        <button
          onClick={fetchContracts}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No contracts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => {
            const totalPrice = contract.agreedQuantityKg * contract.agreedPricePerKg;

            return (
              <div
                key={contract.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="font-semibold text-lg text-gray-900">
                      {contract.listing?.title || `Contract #${contract.id.slice(0, 8)}`}
                    </h2>
                    {getStatusBadge(contract.status)}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-medium text-gray-800">{contract.agreedQuantityKg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price / kg:</span>
                      <span className="font-medium text-gray-800">₹{contract.agreedPricePerKg}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-500 font-medium">Total Value:</span>
                      <span className="font-bold text-emerald-600">₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 pt-1">
                      <span>Delivery:</span>
                      <span>{new Date(contract.deliveryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="pt-4 border-t border-gray-100 flex gap-2">
                  {contract.status === 'PROPOSED' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(contract.id, 'ACCEPTED')}
                        className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(contract.id, 'REJECTED')}
                        className="flex-1 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md transition"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {contract.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleStatusUpdate(contract.id, 'COMPLETED')}
                      className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition"
                    >
                      Mark Completed
                    </button>
                  )}

                  {(contract.status === 'COMPLETED' ||
                    contract.status === 'REJECTED' ||
                    contract.status === 'CANCELLED') && (
                    <span className="text-xs text-gray-400 italic w-full text-center py-1">
                      No further actions available
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};