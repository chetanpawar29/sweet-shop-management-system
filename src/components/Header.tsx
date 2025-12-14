import { Candy, LogOut, Plus, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onAddSweet?: () => void;
}

export default function Header({ onAddSweet }: HeaderProps) {
  const { user, profile, signOut, isAdmin } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl">
              <Candy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sweet Shop</h1>
              <p className="text-xs text-gray-600">Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <>
                <span className="bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  ADMIN
                </span>
                <button
                  onClick={onAddSweet}
                  className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Sweet
                </button>
              </>
            )}

            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">{profile?.email}</span>
            </div>

            <button
              onClick={signOut}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
