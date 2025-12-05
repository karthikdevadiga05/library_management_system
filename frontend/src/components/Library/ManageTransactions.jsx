import React, { useState } from 'react';
import { transactionService } from '../../services/transactionService';
import { CheckCircle, Clock, Book, User, XCircle, DollarSign, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/dateHelper';

const ManageTransactions = ({ transactions, onRefresh }) => {
  const [processingId, setProcessingId] = useState(null);
  const [showFineModal, setShowFineModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleApprovePurchase = async (transactionId) => {
    if (window.confirm('Approve this purchase request?')) {
      setProcessingId(transactionId);
      try {
        await transactionService.approvePurchase(transactionId);
        alert('Purchase approved successfully');
        onRefresh();
      } catch (error) {
        alert('Failed to approve purchase');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleConfirmVisit = async (transactionId) => {
    if (window.confirm('Confirm user visit and issue the book?')) {
      setProcessingId(transactionId);
      try {
        await transactionService.confirmVisit(transactionId);
        alert('Visit confirmed, book issued');
        onRefresh();
      } catch (error) {
        alert('Failed to confirm visit');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleReturnBook = async (transaction) => {
    const fine = transaction.calculated_fine || 0;
    
    if (fine > 0) {
      // Show fine payment modal
      setSelectedTransaction(transaction);
      setShowFineModal(true);
    } else {
      // No fine, return directly
      if (window.confirm('Mark this book as returned?')) {
        setProcessingId(transaction.transaction_id);
        try {
          await transactionService.returnBook(transaction.transaction_id, false);
          alert('Book returned successfully');
          onRefresh();
        } catch (error) {
          alert('Failed to process return');
        } finally {
          setProcessingId(null);
        }
      }
    }
  };

  const handleFinePayment = async (paid) => {
    setShowFineModal(false);
    setProcessingId(selectedTransaction.transaction_id);
    
    try {
      const result = await transactionService.returnBook(selectedTransaction.transaction_id, paid);
      
      if (paid) {
        await transactionService.payFine(selectedTransaction.transaction_id);
        alert(`Book returned successfully!\nFine of $${result.fine.toFixed(2)} has been paid.`);
      } else {
        alert(`Book returned successfully!\nFine of $${result.fine.toFixed(2)} is pending payment.`);
      }
      
      onRefresh();
    } catch (error) {
      alert('Failed to process return');
    } finally {
      setProcessingId(null);
      setSelectedTransaction(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const activeTransactions = transactions.filter(t => t.status === 'active');
  const completedTransactions = transactions.filter(t => t.status === 'completed').slice(0, 10);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Transaction Management</h3>
        <button
          onClick={onRefresh}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Fine Payment Modal */}
      {showFineModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Fine Payment Required</h3>
            <div className="mb-6">
              <p className="text-gray-600 mb-2">Book: <span className="font-semibold">{selectedTransaction.book_title}</span></p>
              <p className="text-gray-600 mb-2">User: <span className="font-semibold">{selectedTransaction.user_name}</span></p>
              <p className="text-red-600 text-2xl font-bold mt-4">
                Fine Amount: ${parseFloat(selectedTransaction.calculated_fine).toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleFinePayment(true)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                Fine Paid - Return Book
              </button>
              <button
                onClick={() => handleFinePayment(false)}
                className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition"
              >
                Return Book (Fine Pending)
              </button>
              <button
                onClick={() => {
                  setShowFineModal(false);
                  setSelectedTransaction(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      {pendingTransactions.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Requests ({pendingTransactions.length})
          </h4>
          <div className="space-y-3">
            {pendingTransactions.map((transaction) => (
              <div key={transaction.transaction_id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Book className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-800">{transaction.book_title}</p>
                        <p className="text-sm text-gray-600">{transaction.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {transaction.user_name}
                      </span>
                      <span>{transaction.user_email}</span>
                      <span>{transaction.user_phone}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-medium capitalize">{transaction.transaction_type}</span>
                      {transaction.price && (
                        <span className="ml-4 text-green-600 font-semibold">${parseFloat(transaction.price).toFixed(2)}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Requested: {formatDate(transaction.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {transaction.transaction_type === 'purchase' ? (
                      <button
                        onClick={() => handleApprovePurchase(transaction.transaction_id)}
                        disabled={processingId === transaction.transaction_id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2 disabled:bg-gray-400"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {processingId === transaction.transaction_id ? 'Processing...' : 'Approve Purchase'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConfirmVisit(transaction.transaction_id)}
                        disabled={processingId === transaction.transaction_id}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2 disabled:bg-gray-400"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {processingId === transaction.transaction_id ? 'Processing...' : 'Confirm Visit'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Loans */}
      {activeTransactions.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Book className="w-5 h-5 text-green-600" />
            Active Loans ({activeTransactions.length})
          </h4>
          <div className="space-y-3">
            {activeTransactions.map((transaction) => {
              const isOverdue = transaction.due_date && new Date(transaction.due_date) < new Date();
              const fine = transaction.calculated_fine || 0;
              
              return (
                <div key={transaction.transaction_id} className={`border rounded-lg p-4 ${
                  isOverdue ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{transaction.book_title}</p>
                      <p className="text-sm text-gray-600 mb-2">{transaction.author}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>User: {transaction.user_name}</span>
                        <span>Borrowed: {formatDate(transaction.borrow_date)}</span>
                        <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                          Due: {formatDate(transaction.due_date)}
                        </span>
                      </div>
                      {fine > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-semibold text-red-600">
                            Fine: ${parseFloat(fine).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(transaction.status)}
                      <button
                        onClick={() => handleReturnBook(transaction)}
                        disabled={processingId === transaction.transaction_id}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2 disabled:bg-gray-400"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {processingId === transaction.transaction_id ? 'Processing...' : 'Return Book'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Transactions */}
      {completedTransactions.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Recent Completed ({completedTransactions.length})
          </h4>
          <div className="space-y-3">
            {completedTransactions.map((transaction) => (
              <div key={transaction.transaction_id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{transaction.book_title}</p>
                    <p className="text-sm text-gray-600">{transaction.author}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <span>User: {transaction.user_name}</span>
                      <span className="capitalize">{transaction.transaction_type}</span>
                       <span>User: {transaction.user_name}</span>
                  <span className="capitalize">{transaction.transaction_type}</span>
                  {transaction.price && (
                    <span className="font-semibold">${parseFloat(transaction.price).toFixed(2)}</span>
                  )}
                  {transaction.fine_amount > 0 && (
                    <span className="text-red-600">Fine: ${parseFloat(transaction.fine_amount).toFixed(2)}</span>
                  )}
                </div>
                {transaction.return_date && (
                  <p className="text-xs text-gray-500 mt-1">
                    Returned: {formatDate(transaction.return_date)}
                  </p>
                )}
              </div>
              <div>
                {getStatusBadge(transaction.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

  {transactions.length === 0 && (
    <div className="text-center py-12">
      <Book className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <p className="text-gray-600">No transactions yet</p>
    </div>
  )}
</div>
);
};
export default ManageTransactions;
