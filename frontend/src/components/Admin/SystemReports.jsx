import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { TrendingUp, Users, Library, Book, DollarSign, Activity } from 'lucide-react';

const SystemReports = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLibraries: 0,
    totalBooks: 0,
    activeLoans: 0,
    totalRevenue: 0,
    pendingTransactions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/system_stats.php');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Reports & Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Users</h3>
            <Users className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-4xl font-bold">{stats.totalUsers}</p>
          <p className="text-sm opacity-75 mt-2">Registered users</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Libraries</h3>
            <Library className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-4xl font-bold">{stats.totalLibraries}</p>
          <p className="text-sm opacity-75 mt-2">Active libraries</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Books</h3>
            <Book className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-4xl font-bold">{stats.totalBooks}</p>
          <p className="text-sm opacity-75 mt-2">Books in system</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Active Loans</h3>
            <Activity className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-4xl font-bold">{stats.activeLoans}</p>
          <p className="text-sm opacity-75 mt-2">Books currently borrowed</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Pending Requests</h3>
            <TrendingUp className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-4xl font-bold">{stats.pendingTransactions}</p>
          <p className="text-sm opacity-75 mt-2">Awaiting action</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
            <DollarSign className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-4xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          <p className="text-sm opacity-75 mt-2">From purchases</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">System Health</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Database</span>
                <span className="text-green-600 font-semibold">Healthy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">API Response</span>
                <span className="text-green-600 font-semibold">Fast</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Storage</span>
                <span className="text-yellow-600 font-semibold">Moderate</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition text-sm">
              Export All Data
            </button>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm">
              Generate Report
            </button>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm">
              Backup Database
            </button>
            <button className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition text-sm">
              System Maintenance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemReports;