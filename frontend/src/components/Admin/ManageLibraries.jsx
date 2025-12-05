import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Library, Search, Mail, Phone, MapPin, Book, Ban, CheckCircle } from 'lucide-react';

const ManageLibraries = () => {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLibraries();
  }, []);

  const loadLibraries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/get_libraries.php');
      setLibraries(response.data);
    } catch (error) {
      console.error('Error loading libraries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (window.confirm(`Change library status to ${newStatus}?`)) {
      try {
        await api.post('/admin/update_user_status.php', {
          user_id: userId,
          status: newStatus
        });
        alert('Library status updated successfully');
        loadLibraries();
      } catch (error) {
        alert('Failed to update library status');
      }
    }
  };

  const filteredLibraries = libraries.filter(lib =>
    lib.library_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lib.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lib.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Libraries</h2>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search libraries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {filteredLibraries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Library className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No libraries found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLibraries.map((lib) => (
            <div key={lib.library_id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Library className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{lib.library_name}</h3>
                    <p className="text-sm text-gray-500">{lib.registration_number}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  lib.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : lib.status === 'inactive'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {lib.status}
                </span>
              </div>

              {lib.description && (
                <p className="text-sm text-gray-600 mb-4">{lib.description}</p>
              )}

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {lib.address}, {lib.city}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {lib.email}
                </p>
                {lib.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {lib.phone}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Book className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">{lib.total_books}</span> books
                </p>
              </div>

              {lib.opening_hours && (
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Hours:</strong> {lib.opening_hours}
                </p>
              )}

              {lib.established_year && (
                <p className="text-sm text-gray-500 mb-4">
                  Established: {lib.established_year}
                </p>
              )}

              <div className="flex gap-2 pt-4 border-t">
                {lib.status !== 'active' && (
                  <button
                    onClick={() => handleStatusChange(lib.user_id, 'active')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Activate
                  </button>
                )}
                {lib.status !== 'suspended' && (
                  <button
                    onClick={() => handleStatusChange(lib.user_id, 'suspended')}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm flex items-center justify-center gap-1"
                  >
                    <Ban className="w-4 h-4" />
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageLibraries;