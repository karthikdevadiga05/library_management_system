import React from 'react';
import { Library, MapPin, Book, Clock, Phone, Mail } from 'lucide-react';

const NearbyLibraries = ({ libraries }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nearby Libraries</h2>
      
      {libraries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Library className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No libraries found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraries.map((library) => (
            <div key={library.library_id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{library.library_name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {library.city}
                  </p>
                </div>
                {library.distance && (
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-semibold">
                    {library.distance} km
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Book className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium">{library.total_books}</span> books
                </p>
                
                {library.opening_hours && (
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    {library.opening_hours}
                  </p>
                )}

                {library.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-indigo-600" />
                    {library.phone}
                  </p>
                )}

                {library.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    {library.email}
                  </p>
                )}
              </div>

              {library.description && (
                <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                  {library.description}
                </p>
              )}

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">{library.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyLibraries;