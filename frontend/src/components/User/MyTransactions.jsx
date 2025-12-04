import React from 'react';
import { Book, Clock, DollarSign, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';
import { formatDate, calculateDaysRemaining } from '../../utils/dateHelper';

const MyTransactions = ({ transactions, onRefresh }) => {
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    const icons = {
      pending: <Clock className="w-4 h-4" />,
      active: <CheckCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      expired: <XCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    return type === 'borrow' ? (
      <Book className="w-5 h-5 text-indigo-600" />
    ) : (
      <DollarSign className="w-5 h-5 text-green-600" />
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Transactions</h2>
        <button
          onClick={onRefresh}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Refresh
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Book className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const daysRemaining = transaction.due_date ? calculateDaysRemaining(transaction.due_date) : null;
            const isOverdue = daysRemaining !== null && daysRemaining < 0;

            return (
              <div key={transaction.transaction_id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {getTypeIcon(transaction.transaction_type)}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{transaction.book_title}</h3>
                      <p className="text-gray-600 mb-2">{transaction.author}</p>
                      <p className="text-sm text-gray-500">{transaction.library_name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    {getStatusBadge(transaction.status)}
                    <p className="text-sm text-gray-500 mt-2 capitalize">{transaction.transaction_type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Requested On</p>
                    <p className="text-sm font-medium">{formatDate(transaction.created_at)}</p>
                  </div>

                  {transaction.due_date && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Due Date</p>
                      <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                        {formatDate(transaction.due_date)}
                      </p>
                    </div>
                  )}

                  {transaction.price && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Price</p>
                      <p className="text-sm font-medium">${parseFloat(transaction.price).toFixed(2)}</p>
                    </div>
                  )}

                  {transaction.calculated_fine > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fine</p>
                      <p className="text-sm font-medium text-red-600">
                        ${parseFloat(transaction.calculated_fine).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {transaction.status === 'pending' && transaction.transaction_type === 'borrow' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Action Required</p>
                      <p>Please visit the library within 24 hours to confirm your booking, or it will be automatically cancelled.</p>
                    </div>
                  </div>
                )}

                {transaction.status === 'active' && daysRemaining !== null && (
                  <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
                    isOverdue 
                      ? 'bg-red-50 border border-red-200' 
                      : daysRemaining <= 3 
                      ? 'bg-orange-50 border border-orange-200'
                      : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <Clock className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      isOverdue ? 'text-red-600' : daysRemaining <= 3 ? 'text-orange-600' : 'text-blue-600'
                    }`} />
                    <div className={`text-sm ${
                      isOverdue ? 'text-red-800' : daysRemaining <= 3 ? 'text-orange-800' : 'text-blue-800'
                    }`}>
                      {isOverdue ? (
                        <>
                          <p className="font-medium">Overdue!</p>
                          <p>This book is {Math.abs(daysRemaining)} days overdue. Please return it immediately.</p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium">{daysRemaining} days remaining</p>
                          <p>Please return the book by {formatDate(transaction.due_date)}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {transaction.status === 'pending' && transaction.transaction_type === 'purchase' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                    <Loader className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Awaiting Approval</p>
                      <p>Your purchase request is pending library approval.</p>
                    </div>
                  </div>
                )}

                {transaction.status === 'expired' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">Booking Expired</p>
                      <p>You did not visit the library within 24 hours. The book has been returned to available stock.</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTransactions;