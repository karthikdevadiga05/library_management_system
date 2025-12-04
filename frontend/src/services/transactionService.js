import api from './api';

export const transactionService = {
  async borrowBook(userId, libraryId, bookId) {
    const response = await api.post('/transactions/borrow_book.php', {
      user_id: userId,
      library_id: libraryId,
      book_id: bookId
    });
    return response.data;
  },

  async purchaseRequest(userId, libraryId, bookId, price) {
    const response = await api.post('/transactions/purchase_request.php', {
      user_id: userId,
      library_id: libraryId,
      book_id: bookId,
      price: price
    });
    return response.data;
  },

  async approvePurchase(transactionId) {
    const response = await api.post('/transactions/approve_purchase.php', {
      transaction_id: transactionId
    });
    return response.data;
  },

  async confirmVisit(transactionId) {
    const response = await api.post('/transactions/confirm_visit.php', {
      transaction_id: transactionId
    });
    return response.data;
  },

  async returnBook(transactionId, finePaid = false) {
    const response = await api.post('/transactions/return_book.php', {
      transaction_id: transactionId,
      fine_paid: finePaid
    });
    return response.data;
  },

  async payFine(transactionId) {
    const response = await api.post('/transactions/pay_fine.php', {
      transaction_id: transactionId
    });
    return response.data;
  },

  async getTransactions(userId, libraryId) {
    let url = '/transactions/get_transactions.php?';
    if (userId) url += `user_id=${userId}`;
    if (libraryId) url += `library_id=${libraryId}`;
    const response = await api.get(url);
    return response.data;
  },

  async checkExpired() {
    const response = await api.get('/transactions/check_expired.php');
    return response.data;
  }
};