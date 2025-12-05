import React, { useState, useEffect } from 'react';
import { bookService } from '../../services/bookService';
import { Book, Search, Edit, AlertCircle } from 'lucide-react';

const BookInventory = ({ libraryId }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBook, setEditingBook] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');

  useEffect(() => {
    loadBooks();
  }, [libraryId]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await bookService.getLibraryBooks(libraryId);
      setBooks(data);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (book) => {
    const qty = parseInt(newQuantity);
    const borrowed = book.total_copies - book.available_copies;
    
    if (!newQuantity || qty < 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (qty < borrowed) {
      alert(`Cannot set quantity to ${qty}.\n\nCurrently ${borrowed} copies are borrowed.\nMinimum quantity must be ${borrowed} or higher.`);
      return;
    }

    try {
      await bookService.updateQuantity(book.book_id, qty);
      alert('Book quantity updated successfully!');
      setEditingBook(null);
      setNewQuantity('');
      loadBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h3 className="text-xl font-bold text-gray-800">Book Inventory</h3>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <Book className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            {searchTerm ? 'No books found matching your search' : 'No books in inventory yet'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Copies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.map((book) => {
                const borrowed = book.total_copies - book.available_copies;
                
                return (
                  <tr key={book.book_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{book.title}</p>
                        <p className="text-sm text-gray-600">{book.author}</p>
                        {book.isbn && (
                          <p className="text-xs text-gray-500 mt-1">ISBN: {book.isbn}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                        {book.category || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      ${parseFloat(book.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {editingBook === book.book_id ? (
                        <div>
                          <input
                            type="number"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(e.target.value)}
                            className="w-20 px-2 py-1 border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500"
                            min={borrowed}
                            placeholder={book.total_copies}
                          />
                          {parseInt(newQuantity) < borrowed && (
                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              Min: {borrowed}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-600">{book.total_copies}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`font-semibold ${
                          book.available_copies > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {book.available_copies}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          ({borrowed} borrowed)
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        book.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingBook === book.book_id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(book)}
                            disabled={parseInt(newQuantity) < borrowed}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingBook(null);
                              setNewQuantity('');
                            }}
                            className="bg-gray-400 text-white px-3 py-1 rounded text-xs hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingBook(book.book_id);
                            setNewQuantity(book.total_copies.toString());
                          }}
                          className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700 flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Update Qty
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> You can update book quantities anytime. 
          However, you cannot reduce the quantity below the number of currently borrowed copies.
        </p>
      </div>

      <div className="mt-4 text-sm text-gray-600 flex justify-between">
        <span>Showing {filteredBooks.length} of {books.length} books</span>
        <span>Total copies: {books.reduce((sum, b) => sum + b.total_copies, 0)}</span>
      </div>
    </div>
  );
};

export default BookInventory;