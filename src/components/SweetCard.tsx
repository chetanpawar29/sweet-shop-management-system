import { ShoppingCart, Edit, Trash2, Package } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Sweet = Database['public']['Tables']['sweets']['Row'];

interface SweetCardProps {
  sweet: Sweet;
  isAdmin: boolean;
  onPurchase: (sweet: Sweet) => void;
  onEdit?: (sweet: Sweet) => void;
  onDelete?: (sweet: Sweet) => void;
  onRestock?: (sweet: Sweet) => void;
}

export default function SweetCard({
  sweet,
  isAdmin,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
}: SweetCardProps) {
  const outOfStock = sweet.quantity === 0;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden bg-gray-200">
        {sweet.image_url ? (
          <img
            src={sweet.image_url}
            alt={sweet.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-orange-100">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
              Out of Stock
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          ${sweet.price.toFixed(2)}
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{sweet.name}</h3>
          <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">
            {sweet.category}
          </span>
        </div>

        {sweet.description && (
          <p className="text-gray-600 text-sm line-clamp-2">{sweet.description}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-gray-600">
            Stock: <span className="font-semibold text-gray-900">{sweet.quantity}</span>
          </span>
        </div>

        <div className="flex gap-2 pt-2">
          {!isAdmin && (
            <button
              onClick={() => onPurchase(sweet)}
              disabled={outOfStock}
              className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Purchase
            </button>
          )}

          {isAdmin && (
            <>
              <button
                onClick={() => onEdit?.(sweet)}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onRestock?.(sweet)}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                Restock
              </button>
              <button
                onClick={() => onDelete?.(sweet)}
                className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
