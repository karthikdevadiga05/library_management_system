import React from 'react';

const Card = ({ children, className = '', hover = false, padding = true }) => {
  const baseClasses = 'bg-white rounded-lg shadow-md';
  const hoverClasses = hover ? 'card-hover cursor-pointer' : '';
  const paddingClasses = padding ? 'p-6' : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`}>
    {children}
  </div>
);

export default Card;