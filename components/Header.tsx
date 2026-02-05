
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b-4 border-yellow-400 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-md">
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="text-2xl font-kids text-blue-600 tracking-wide">
            奇幻绘本馆 <span className="text-pink-500">AI</span>
          </h1>
        </Link>
        <nav>
          <Link 
            to="/" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-lg active:translate-y-1"
          >
            新故事
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
