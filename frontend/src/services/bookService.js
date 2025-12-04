import api from './api';

export const bookService = {
  async searchBooks(query, latitude, longitude) {
    const response = await api.get(`/books/search_books.php?q=${query}&lat=${latitude}&lon=${longitude}`);
    return response.data;
  },

  async addBook(bookData) {
    const response = await api.post('/books/add_book.php', bookData);
    return response.data;
  },

  async getLibraryBooks(libraryId) {
    const response = await api.get(`/books/get_books.php?library_id=${libraryId}`);
    return response.data;
  },

  async updateQuantity(bookId, quantity) {
    const response = await api.post('/books/update_quantity.php', {
      book_id: bookId,
      quantity: quantity
    });
    return response.data;
  }
};