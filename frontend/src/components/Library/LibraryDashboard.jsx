import React, { useState, useEffect } from 'react';
import { LogOut, Book, Users, TrendingUp, DollarSign } from 'lucide-react';
import { transactionService } from '../../services/transactionService';
import AddBook from './AddBook';
import BookInventory from './BookInventory';
import ManageTransactions from './ManageTransactions';

const LibraryDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeLoans: 0,
    pendingRequests: 0,
    revenue: 0
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
  try {
    const data = await transactionService.getTransactions(null, user.library_id);
    setTransactions(data);
    
    const activeLoans = data.filter(t => t.transaction_type === 'borrow' && t.status === 'active').length;
    const pendingRequests = data.filter(t => t.status === 'pending').length;
    const revenue = data
      .filter(t => t.transaction_type === 'purchase' && t.status === 'completed')
      .reduce((sum, t) => sum + parseFloat(t.price || 0), 0);

    // Get actual total books from library stats
    try {
      const statsResponse = await fetch(`http://localhost/library-management-system/backend/api/libraries/get_library_stats.php?library_id=${user.library_id}`);
      const statsData = await statsResponse.json();
      
      setStats({
        totalBooks: statsData.total_books || 0,
        activeLoans,
        pendingRequests,
        revenue
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to user data
      setStats({
        totalBooks: user.total_books || 0,
        activeLoans,
        pendingRequests,
        revenue
      });
    }
  } catch (error) {
    console.error('Error loading transactions:', error);
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{user.library_name}</h1>
              <p className="text-indigo-200 text-sm mt-1">{user.city}</p>
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Books</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalBooks}</p>
              </div>
              <Book className="w-12 h-12 text-indigo-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Active Loans</p>
                <p className="text-3xl font-bold text-gray-800">{stats.activeLoans}</p>
              </div>
              <Users className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-800">{stats.pendingRequests}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-yellow-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Revenue</p>
                <p className="text-3xl font-bold text-gray-800">${stats.revenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-t-lg">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'inventory'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Book Inventory
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'add'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Add New Book
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 font-medium transition ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Manage Transactions
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-b-lg p-6">
          {activeTab === 'inventory' && (
            <BookInventory libraryId={user.library_id} />
          )}

          {activeTab === 'add' && (
            <AddBook libraryId={user.library_id} onSuccess={() => setActiveTab('inventory')} />
          )}

          {activeTab === 'transactions' && (
            <ManageTransactions 
              transactions={transactions} 
              onRefresh={loadTransactions}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryDashboard;