
import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../types';

interface HistoryListProps {
  books: Book[];
  onDelete: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ books, onDelete }) => {
  if (books.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-kids text-blue-600">我的魔法图书馆</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book.id} className="group relative bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-400">
            <Link to={`/book/${book.id}`} className="block">
              <div className="aspect-[4/3] rounded-xl bg-gray-100 mb-4 overflow-hidden relative">
                {book.pages[0]?.imageUrl ? (
                  <img src={book.pages[0].imageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📖</div>
                )}
                <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-black uppercase text-gray-600">
                  {book.style}
                </div>
              </div>
              <h4 className="font-kids text-xl text-pink-600 truncate">{book.title}</h4>
              <p className="text-xs text-gray-400 mt-1">创作于 {new Date(book.createdAt).toLocaleDateString()}</p>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                if(confirm("确定要删除这本绘本吗？")) onDelete(book.id);
              }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
