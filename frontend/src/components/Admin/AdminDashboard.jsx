import React, { useState } from 'react';
import { LogOut, Users, Library, BarChart } from 'lucide-react';
import ManageUsers from './ManageUsers';
import ManageLibraries from './ManageLibraries';
import SystemReports from './SystemReports';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-indigo-200 text-sm mt-1">System Administration</p>
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
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab('libraries')}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                activeTab === 'libraries'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Library className="w-4 h-4" />
              Manage Libraries
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                activeTab === 'reports'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart className="w-4 h-4" />
              System Reports
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'users' && <ManageUsers />}
        {activeTab === 'libraries' && <ManageLibraries />}
        {activeTab === 'reports' && <SystemReports />}
      </div>
    </div>
  );
};

export default AdminDashboard;
