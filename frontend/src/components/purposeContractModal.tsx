import React, { useState } from 'react';
import { contractService } from '../services/contractservice';

interface ProposeContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    pricePerKg: number;
    availableQuantityKg: number;
    farmerId: string;
  };
  buyerId: string;
  onSuccess?: () => void;
}

export const ProposeContractModal: React.FC<ProposeContractModalProps> = ({
  isOpen,
  onClose,
  listing,
  buyerId,
  onSuccess,
}) => {
  const [agreedQuantityKg, setAgreedQuantityKg] = useState<number>(listing.availableQuantityKg);
  const [agreedPricePerKg, setAgreedPricePerKg] = useState<number>(listing.pricePerKg);
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await contractService.proposeContract({
        listingId: listing.id,
        buyerId: buyerId,
        farmerId: listing.farmerId,
        agreedQuantityKg: Number(agreedQuantityKg),
        agreedPricePerKg: Number(agreedPricePerKg),
        deliveryDate: new Date(deliveryDate).toISOString(),
      });

      alert('Contract proposal sent successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit proposal.');
    } finally {
      setLoading(false);
    }
  };

  const totalCalculatedValue = (agreedQuantityKg || 0) * (agreedPricePerKg || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Propose Agreement</h2>
        <p className="text-sm text-gray-500 mb-4">Item: <span className="font-semibold text-gray-700">{listing.title}</span></p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Quantity (kg)
            </label>
            <input
              type="number"
              min="1"
              max={listing.availableQuantityKg}
              value={agreedQuantityKg}
              onChange={(e) => setAgreedQuantityKg(Number(e.target.value))}
              required
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Offered Price per kg (₹)
            </label>
            <input
              type="number"
              min="1"
              value={agreedPricePerKg}
              onChange={(e) => setAgreedPricePerKg(Number(e.target.value))}
              required
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex justify-between items-center text-sm">
            <span className="font-medium text-emerald-800">Total Contract Value:</span>
            <span className="font-bold text-emerald-700 text-base">₹{totalCalculatedValue.toLocaleString()}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};