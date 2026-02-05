
import React from 'react';

interface LoadingScreenProps {
  message: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-500/90 backdrop-blur-sm">
      <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 border-8 border-yellow-200 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-yellow-400 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl">✨</div>
        </div>
        <h2 className="text-2xl font-kids text-blue-600 mb-4">魔法生成中...</h2>
        <p className="text-gray-600 font-medium animate-pulse">{message}</p>
        
        <div className="mt-8 flex space-x-2">
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-75"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-150"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
