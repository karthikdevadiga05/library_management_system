import React, { useState, useEffect, useCallback } from 'react';
import { Search, Book, Library, MapPin, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { bookService } from '../../services/bookService';

const SearchBooks = ({ user, onBorrow, onPurchase, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search function
  useEffect(() => {
    // Don't search if query is empty or less than 2 characters
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    // Set a delay for live search (500ms after user stops typing)
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    // Cleanup timeout if user keeps typing
    return () => clearTimeout(timeoutId);
  }, [searchQuery, user.latitude, user.longitude]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setSearching(true);
    setHasSearched(true);
    
    try {
      const results = await bookService.searchBooks(query, user.latitude, user.longitude);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }
    performSearch(searchQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Search Books</h2>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Start typing to search by title, author, or category..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {searchQuery.length > 0 && searchQuery.length < 2 
            ? 'Type at least 2 characters to search' 
            : searchQuery.length >= 2 
            ? 'Searching as you type...' 
            : 'Results update automatically as you type'}
        </p>
      </div>

      {searching && searchQuery.length >= 2 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Loader2 className="w-16 h-16 mx-auto text-indigo-600 mb-4 animate-spin" />
          <p className="text-gray-600">Searching for "{searchQuery}"...</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Found <span className="font-semibold text-indigo-600">{searchResults.length}</span> result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}" (sorted by nearest library)
          </p>
          
          {searchResults.map((book, index) => (
            <div key={`${book.book_id}-${book.library_id}-${index}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{book.title}</h3>
                  <p className="text-gray-600 mb-4">by {book.author}</p>
                  
                  {book.description && (
                    <p className="text-sm text-gray-600 mb-4">{book.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    {book.publisher && (
                      <div>
                        <span className="text-gray-500">Publisher:</span>
                        <span className="ml-2 font-medium">{book.publisher}</span>
                      </div>
                    )}
                    {book.publication_year && (
                      <div>
                        <span className="text-gray-500">Year:</span>
                        <span className="ml-2 font-medium">{book.publication_year}</span>
                      </div>
                    )}
                    {book.category && (
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <span className="ml-2 font-medium">{book.category}</span>
                      </div>
                    )}
                    {book.language && (
                      <div>
                        <span className="text-gray-500">Language:</span>
                        <span className="ml-2 font-medium">{book.language}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Library className="w-4 h-4 text-indigo-600" />
                      {book.library_name}
                    </span>
                    <span className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      {book.distance} km away
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="text-right mb-4">
                    <p className="text-3xl font-bold text-indigo-600">${book.price}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {book.available_copies > 0 ? (
                        <span className="text-green-600 font-medium">
                          {book.available_copies} available
                        </span>
                      ) : (
                        <span className="text-red-600 font-medium">Not available</span>
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => onBorrow(book, { library_id: book.library_id, library_name: book.library_name })}
                      disabled={book.available_copies === 0 || loading}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Book className="w-5 h-5" />
                      Borrow Book
                    </button>
                    
                    <button
                      onClick={() => onPurchase(book, { library_id: book.library_id, library_name: book.library_name })}
                      disabled={book.available_copies === 0 || loading}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-5 h-5" />
                      Purchase Book
                    </button>

                    {book.available_copies === 0 && (
                      <p className="text-xs text-red-600 text-center flex items-center justify-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Currently unavailable
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : hasSearched && searchQuery.length >= 2 && !searching ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Book className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No books found for "{searchQuery}"</p>
          <p className="text-sm text-gray-500 mt-2">Try a different search term or check the spelling</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">Start typing to search for books</p>
          <p className="text-sm text-gray-500 mt-2">Enter at least 2 characters to begin searching</p>
        </div>
      )}
    </div>
  );
};

export default SearchBooks;