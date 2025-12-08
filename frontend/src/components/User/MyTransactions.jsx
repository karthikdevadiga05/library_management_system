import React, { useState } from 'react';
import { Book, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, Calendar } from 'lucide-react';
import { transactionService } from '../../services/transactionService';

const MyTransactions = ({ transactions, onRefresh }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      default: return <Book className="w-4 h-4" />;
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePayFine = async (transactionId) => {
    if (!window.confirm('Confirm fine payment?')) return;

    try {
      await transactionService.payFine(transactionId);
      alert('Fine paid successfully!');
      onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to process payment');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCheckExpired = async () => {
    try {
      const response = await transactionService.checkExpired();
      if (response.expired_count > 0) {
        alert(`${response.expired_count} expired transaction(s) found and processed.`);
      } else {
        alert('No expired transactions found.');
      }
      onRefresh();
    } catch (error) {
      console.error('Error checking expired:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Transactions</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCheckExpired}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition text-sm"
          >
            Check Expired
          </button>
          <button
            onClick={onRefresh}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Book className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const daysRemaining = getDaysRemaining(transaction.due_date);
            const overdue = isOverdue(transaction.due_date);
            
            return (
              <div key={transaction.transaction_id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{transaction.book_title || transaction.title}</h3>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        {transaction.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">by {transaction.author}</p>
                    <p className="text-sm text-gray-500">{transaction.library_name}</p>
                  </div>
                  
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      transaction.transaction_type === 'borrow' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {transaction.transaction_type === 'borrow' ? 'Borrowed' : 'Purchase'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(transaction.created_at)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(transaction.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {transaction.transaction_type === 'borrow' && transaction.due_date && (
                    <div>
                      <p className="text-gray-500">Due Date</p>
                      <p className={`font-medium flex items-center gap-1 ${overdue ? 'text-red-600' : 'text-gray-800'}`}>
                        <Clock className="w-4 h-4" />
                        {formatDate(transaction.due_date)}
                      </p>
                    </div>
                  )}

                  {transaction.return_date && (
                    <div>
                      <p className="text-gray-500">Returned</p>
                      <p className="font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {formatDate(transaction.return_date)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.return_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}

                  {transaction.price && (
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="font-medium flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        ${parseFloat(transaction.price).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Overdue Warning */}
                {transaction.status === 'active' && overdue && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-800 text-sm font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      OVERDUE by {Math.abs(daysRemaining)} days! Return immediately to avoid additional fines.
                    </p>
                  </div>
                )}

                {/* Days Remaining Warning */}
                {transaction.status === 'active' && !overdue && daysRemaining !== null && daysRemaining <= 3 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-yellow-800 text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining to return this book
                    </p>
                  </div>
                )}

                {/* Fine Information */}
                {transaction.fine_amount > 0 && (
                  <div className={`border rounded-lg p-3 mb-4 ${
                    transaction.payment_status === 'paid' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`font-semibold flex items-center gap-2 ${
                          transaction.payment_status === 'paid' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          <DollarSign className="w-4 h-4" />
                          Fine: ${parseFloat(transaction.fine_amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: {transaction.payment_status === 'paid' ? 'Paid' : 'Pending Payment'}
                        </p>
                      </div>
                      {transaction.payment_status === 'pending' && (
                        <button
                          onClick={() => handlePayFine(transaction.transaction_id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          Pay Fine
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  {transaction.status === 'active' && transaction.transaction_type === 'borrow' && (
                    <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 text-sm font-semibold">
                        📚 Please return this book to the library when finished. Library staff will process the return.
                      </p>
                    </div>
                  )}

                  {transaction.status === 'pending' && transaction.transaction_type === 'borrow' && !transaction.visit_confirmed && (
                    <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm font-semibold">
                        ⚠️ Please visit the library within 24 hours to confirm your borrow request
                      </p>
                    </div>
                  )}

                  {transaction.status === 'pending' && transaction.transaction_type === 'purchase' && (
                    <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 text-sm font-semibold">
                        ⏳ Waiting for library approval
                      </p>
                    </div>
                  )}

                  {transaction.status === 'expired' && (
                    <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm font-semibold">
                        ❌ Booking expired - You did not visit the library within 24 hours
                      </p>
                    </div>
                  )}

                  {transaction.status === 'completed' && transaction.transaction_type === 'borrow' && (
                    <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-sm font-semibold">
                        ✅ Book returned successfully
                      </p>
                    </div>
                  )}

                  {transaction.status === 'completed' && transaction.transaction_type === 'purchase' && (
                    <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-sm font-semibold">
                        ✅ Purchase completed - Book is now yours!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTransactions;