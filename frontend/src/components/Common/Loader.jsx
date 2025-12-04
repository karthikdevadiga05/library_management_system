import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 
        className={`${sizeClasses[size]} text-indigo-600 animate-spin`} 
      />
      {message && (
        <p className="mt-4 text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );
};

// Alternative spinner styles
export const SpinnerDots = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
  </div>
);

export const SpinnerCircle = () => (
  <div className="flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
  </div>
);

export const PageLoader = ({ message = 'Loading page...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-600 text-lg font-medium">{message}</p>
    </div>
  </div>
);

export default Loader;