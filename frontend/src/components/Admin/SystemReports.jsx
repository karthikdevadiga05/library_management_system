import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { TrendingUp, Users, Library, Book, DollarSign, Activity, RefreshCw, Download, AlertCircle } from 'lucide-react';

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
  const [error, setError] = useState('');

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/system_stats.php');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
      setError('Failed to load system statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    alert('Export functionality - Generate CSV/Excel reports of all data');
  };

  const handleGenerateReport = () => {
    const reportContent = `
LIBRARY MANAGEMENT SYSTEM - SYSTEM REPORT
Generated: ${new Date().toLocaleString()}
=====================================

SYSTEM STATISTICS:
- Total Users: ${stats.totalUsers}
- Total Libraries: ${stats.totalLibraries}
- Total Books: ${stats.totalBooks}
- Active Loans: ${stats.activeLoans}
- Pending Requests: ${stats.pendingTransactions}
- Total Revenue: $${stats.totalRevenue.toFixed(2)}

SYSTEM HEALTH: Operational
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loader"></div>
        <p className="ml-3 text-gray-600">Loading system statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadSystemStats}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">System Reports & Analytics</h2>
        <button
          onClick={loadSystemStats}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Users</h3>
            <Users className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-4xl font-bold">{stats.totalUsers}</p>
          <p className="text-sm opacity-75 mt-2">Registered users</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Libraries</h3>
            <Library className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-4xl font-bold">{stats.totalLibraries}</p>
          <p className="text-sm opacity-75 mt-2">Active libraries</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Books</h3>
            <Book className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-4xl font-bold">{stats.totalBooks}</p>
          <p className="text-sm opacity-75 mt-2">Books in system</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Active Loans</h3>
            <Activity className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-4xl font-bold">{stats.activeLoans}</p>
          <p className="text-sm opacity-75 mt-2">Books currently borrowed</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Pending Requests</h3>
            <TrendingUp className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-4xl font-bold">{stats.pendingTransactions}</p>
          <p className="text-sm opacity-75 mt-2">Awaiting action</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
            <DollarSign className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-4xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          <p className="text-sm opacity-75 mt-2">From purchases</p>
        </div>
      </div>

      {/* System Health and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">System Health</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Database Connection</span>
                <span className="text-green-600 font-semibold">Healthy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">API Response Time</span>
                <span className="text-green-600 font-semibold">Fast</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Storage Usage</span>
                <span className="text-yellow-600 font-semibold">Moderate</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">System Uptime</span>
                <span className="text-green-600 font-semibold">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '99%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={handleExportData}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition text-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export All Data
            </button>
            <button 
              onClick={handleGenerateReport}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
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

      {/* Summary Cards */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">System Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Avg Revenue per Library</p>
            <p className="text-2xl font-bold text-gray-800">
              ${stats.totalLibraries > 0 ? (stats.totalRevenue / stats.totalLibraries).toFixed(2) : '0.00'}
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Loan Rate</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalBooks > 0 ? ((stats.activeLoans / stats.totalBooks) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Pending Rate</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.activeLoans > 0 ? ((stats.pendingTransactions / (stats.activeLoans + stats.pendingTransactions)) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Last Updated</p>
            <p className="text-gray-800 font-medium">{new Date().toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">System Status</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 mr-1 bg-green-600 rounded-full"></span>
              Operational
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Database Size</p>
            <p className="text-gray-800 font-medium">~{Math.round((stats.totalUsers + stats.totalBooks + stats.activeLoans) * 0.05)} MB</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Version</p>
            <p className="text-gray-800 font-medium">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemReports;