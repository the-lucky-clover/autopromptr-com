
import React from 'react';

interface StaticModuleWrapperProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const StaticModuleWrapper = ({
  title,
  children,
  className = ''
}: StaticModuleWrapperProps) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Module Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
      </div>
      
      {/* Module Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default StaticModuleWrapper;
