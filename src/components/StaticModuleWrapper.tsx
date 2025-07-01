
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
    <div className={`bg-white/10 backdrop-blur-sm border-white/20 rounded-xl border ${className}`}>
      {/* Module Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">
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
