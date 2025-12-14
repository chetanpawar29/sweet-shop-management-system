import { useState } from 'react';
import { X, Package } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Sweet = Database['public']['Tables']['sweets']['Row'];

interface RestockModalProps {
  sweet: Sweet | null;
  isOpen: boolean;
  onClose: () => void;
  onRestock: (sweetId: string, quantity: number) => Promise<void>;
}

export default function RestockModal({ sweet, isOpen, onClose, onRestock }: RestockModalProps) {
  const [quantity, setQuantity] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sweet) return;

    setError('');
    setLoading(true);

    try {
      await onRestock(sweet.id, quantity);
      onClose();
      setQuantity(10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restock');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !sweet) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            <h2 className="text-xl font-bold">Restock Item</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">{sweet.name}</h3>
            <p className="text-sm text-gray-600">Current Stock: {sweet.quantity}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Add
            </label>
            <input
              type="number"
              required
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="10"
            />
            <p className="text-xs text-gray-500 mt-1">
              New stock will be: {sweet.quantity + quantity}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Restocking...' : 'Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
