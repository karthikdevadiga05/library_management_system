import React, { useState, useEffect } from 'react';
import { LogOut, Search, Book, MapPin } from 'lucide-react';
import { libraryService } from '../../services/libraryService';
import { transactionService } from '../../services/transactionService';
import NearbyLibraries from './NearbyLibraries';
import SearchBooks from './SearchBooks';
import MyTransactions from './MyTransactions';

const UserDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [libraries, setLibraries] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNearbyLibraries();
    loadTransactions();
    const interval = setInterval(() => {
      transactionService.checkExpired();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadNearbyLibraries = async () => {
    try {
      const data = await libraryService.getNearbyLibraries(user.latitude, user.longitude);
      setLibraries(data);
    } catch (error) {
      console.error('Error loading libraries:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await transactionService.getTransactions(user.user_id, null);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleBorrow = async (book, library) => {
    if (book.available_copies <= 0) {
      alert('Book not available');
      return;
    }

    setLoading(true);
    try {
      await transactionService.borrowBook(user.user_id, library.library_id, book.book_id);
      alert('Book borrowed! Please visit the library within 24 hours to confirm.');
      loadTransactions();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to borrow book');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (book, library) => {
    setLoading(true);
    try {
      await transactionService.purchaseRequest(user.user_id, library.library_id, book.book_id, book.price);
      alert('Purchase request sent! Waiting for library approval.');
      loadTransactions();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send purchase request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{user.full_name}</h1>
              <p className="text-indigo-200 text-sm flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {user.city}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-800 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'home'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'search'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Search Books
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Book className="w-4 h-4 inline mr-2" />
              My Transactions
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'home' && <NearbyLibraries libraries={libraries} />}
        {activeTab === 'search' && (
          <SearchBooks
            user={user}
            onBorrow={handleBorrow}
            onPurchase={handlePurchase}
            loading={loading}
          />
        )}
        {activeTab === 'transactions' && (
          <MyTransactions transactions={transactions} onRefresh={loadTransactions} />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;