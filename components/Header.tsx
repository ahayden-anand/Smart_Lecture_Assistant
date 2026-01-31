
import React from 'react';
import { MicIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <MicIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Smart Lecture Assistant</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
