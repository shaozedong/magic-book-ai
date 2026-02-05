
import React, { useState } from 'react';
import { ArtStyle } from '../types';

interface StoryFormProps {
  onSubmit: (topic: string, style: ArtStyle) => void;
  isLoading: boolean;
}

const styles = [
  { id: ArtStyle.GHIBLI, label: '吉卜力风', emoji: '🎬', color: 'bg-green-100 border-green-300 text-green-700' },
  { id: ArtStyle.WATERCOLOR, label: '清新水彩', emoji: '🎨', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { id: ArtStyle.OIL_PAINTING, label: '古典油画', emoji: '🖼️', color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { id: ArtStyle.STORYBOOK, label: '现代绘本', emoji: '📚', color: 'bg-pink-100 border-pink-300 text-pink-700' },
];

const StoryForm: React.FC<StoryFormProps> = ({ onSubmit, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(ArtStyle.STORYBOOK);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onSubmit(topic, selectedStyle);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-blue-100 max-w-2xl mx-auto">
      <h2 className="text-3xl font-kids text-blue-600 mb-6 text-center">今天我们来畅想什么故事？</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-gray-700 font-bold mb-2 ml-2">故事主题</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例如：一只爱吃小饼干的彩色小恐龙..."
            className="w-full h-32 px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:ring-0 resize-none transition-all outline-none text-lg"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-3 ml-2">选择画风</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {styles.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id)}
                className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
                  selectedStyle === style.id 
                    ? `${style.color} border-current ring-4 ring-offset-2 ring-blue-100 scale-105` 
                    : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                }`}
              >
                <span className="text-3xl mb-1">{style.emoji}</span>
                <span className="text-xs font-bold text-center">{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-full text-xl shadow-lg transition-all transform hover:-translate-y-1 active:translate-y-0"
        >
          {isLoading ? '正在施展魔法...' : '生成我的绘本! ✨'}
        </button>
      </form>
    </div>
  );
};

export default StoryForm;
