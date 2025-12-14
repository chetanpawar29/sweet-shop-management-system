import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import SweetCard from '../components/SweetCard';
import SweetModal from '../components/SweetModal';
import RestockModal from '../components/RestockModal';
import type { Database } from '../lib/database.types';

type Sweet = Database['public']['Tables']['sweets']['Row'];
type SweetInsert = Database['public']['Tables']['sweets']['Insert'];

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [filteredSweets, setFilteredSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | undefined>(undefined);
  const [restockingSweet, setRestockingSweet] = useState<Sweet | null>(null);

  useEffect(() => {
    loadSweets();
  }, []);

  useEffect(() => {
    filterSweets();
  }, [sweets, searchTerm, selectedCategory, priceRange]);

  async function loadSweets() {
    try {
      const { data, error } = await supabase
        .from('sweets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSweets(data || []);
      const uniqueCategories = Array.from(new Set(data?.map((s) => s.category) || []));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading sweets:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterSweets() {
    let filtered = [...sweets];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (sweet) =>
          sweet.name.toLowerCase().includes(term) ||
          sweet.category.toLowerCase().includes(term) ||
          sweet.description?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((sweet) => sweet.category === selectedCategory);
    }

    if (priceRange !== 'all') {
      filtered = filtered.filter((sweet) => {
        if (priceRange === 'low') return sweet.price < 2;
        if (priceRange === 'medium') return sweet.price >= 2 && sweet.price < 4;
        if (priceRange === 'high') return sweet.price >= 4;
        return true;
      });
    }

    setFilteredSweets(filtered);
  }

  async function handleAddSweet(sweetData: SweetInsert) {
    const { error } = await supabase.from('sweets').insert([sweetData]);

    if (error) throw error;
    await loadSweets();
  }

  async function handleUpdateSweet(sweetData: SweetInsert) {
    if (!editingSweet) return;

    const { error } = await supabase
      .from('sweets')
      .update(sweetData)
      .eq('id', editingSweet.id);

    if (error) throw error;
    await loadSweets();
    setEditingSweet(undefined);
  }

  async function handleDeleteSweet(sweet: Sweet) {
    if (!confirm(`Are you sure you want to delete "${sweet.name}"?`)) return;

    const { error } = await supabase.from('sweets').delete().eq('id', sweet.id);

    if (error) {
      alert('Error deleting sweet: ' + error.message);
      return;
    }

    await loadSweets();
  }

  async function handlePurchase(sweet: Sweet) {
    if (sweet.quantity === 0) return;

    const { error } = await supabase
      .from('sweets')
      .update({ quantity: sweet.quantity - 1 })
      .eq('id', sweet.id);

    if (error) {
      alert('Error purchasing sweet: ' + error.message);
      return;
    }

    await loadSweets();
  }

  async function handleRestock(sweetId: string, quantity: number) {
    const sweet = sweets.find((s) => s.id === sweetId);
    if (!sweet) return;

    const { error } = await supabase
      .from('sweets')
      .update({ quantity: sweet.quantity + quantity })
      .eq('id', sweetId);

    if (error) throw error;
    await loadSweets();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sweets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50 to-orange-50">
      <Header onAddSweet={() => setIsAddModalOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search sweets by name, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option value="all">All Prices</option>
                <option value="low">Under $2</option>
                <option value="medium">$2 - $4</option>
                <option value="high">$4+</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredSweets.length} of {sweets.length} sweets
            </p>
            {(searchTerm || selectedCategory !== 'all' || priceRange !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPriceRange('all');
                }}
                className="text-sm text-pink-600 hover:text-pink-700 font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {filteredSweets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No sweets found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSweets.map((sweet) => (
              <SweetCard
                key={sweet.id}
                sweet={sweet}
                isAdmin={isAdmin}
                onPurchase={handlePurchase}
                onEdit={(sweet) => {
                  setEditingSweet(sweet);
                  setIsAddModalOpen(true);
                }}
                onDelete={handleDeleteSweet}
                onRestock={(sweet) => setRestockingSweet(sweet)}
              />
            ))}
          </div>
        )}
      </main>

      <SweetModal
        sweet={editingSweet}
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSweet(undefined);
        }}
        onSave={editingSweet ? handleUpdateSweet : handleAddSweet}
      />

      <RestockModal
        sweet={restockingSweet}
        isOpen={!!restockingSweet}
        onClose={() => setRestockingSweet(null)}
        onRestock={handleRestock}
      />
    </div>
  );
}
