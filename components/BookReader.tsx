
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Book } from '../types';
import { generatePageSpeech } from '../services/geminiService';

interface BookReaderProps {
  books: Book[];
}

// 基础音效处理工具
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const BookReader: React.FC<BookReaderProps> = ({ books }) => {
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const currentPageRef = useRef(0); // 用于追踪当前请求的页面，防止异步回调导致的声音重叠

  const book = books.find(b => b.id === id);

  // 同步 ref
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // 组件卸载时停止声音
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // 翻页逻辑：停止旧音频，视情况开启新朗读
  useEffect(() => {
    stopAudio();
    if (autoPlay && book) {
      handlePlaySpeech();
    }
  }, [currentPage]);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // 防止已经停止的节点再次调用报错
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const handlePlaySpeech = async () => {
    if (!book) return;
    
    // 如果正在播放，点击则是停止
    if (isPlaying) {
      stopAudio();
      return;
    }

    const pageAtStart = currentPage;
    setLoadingAudio(true);
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      // 异步获取音频
      const base64Audio = await generatePageSpeech(book.pages[currentPage].text);
      
      // 检查：如果用户在加载期间已经翻页，则不再播放旧页面的声音
      if (currentPageRef.current !== pageAtStart) {
        return;
      }

      const audioBuffer = await decodeAudioData(
        decodeBase64(base64Audio),
        audioContextRef.current,
        24000,
        1
      );

      // 再次检查确认
      if (currentPageRef.current !== pageAtStart) {
        return;
      }

      // 播放前确保清理掉之前的
      stopAudio();

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        // 只有当结束的音频确实是当前正在运行的节点时才重置状态
        if (sourceNodeRef.current === source) {
          setIsPlaying(false);
        }
      };
      
      sourceNodeRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (err) {
      console.error("Audio playback error:", err);
    } finally {
      if (currentPageRef.current === pageAtStart) {
        setLoadingAudio(false);
      }
    }
  };

  if (!book) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-kids text-red-500 mb-4">找不到这本绘本！</h2>
        <Link to="/" className="text-blue-500 font-bold underline">回到图书馆</Link>
      </div>
    );
  }

  const totalPages = book.pages.length;
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link to="/" className="text-blue-500 font-bold hover:underline flex items-center">
          <span className="mr-1">←</span> 我的书架
        </Link>
        <div className="flex items-center space-x-4">
          <label className="flex items-center cursor-pointer select-none">
            <span className="mr-2 text-sm font-bold text-gray-500">自动朗读</span>
            <div 
              className={`w-12 h-6 rounded-full transition-colors relative ${autoPlay ? 'bg-green-400' : 'bg-gray-300'}`}
              onClick={() => setAutoPlay(!autoPlay)}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoPlay ? 'left-7' : 'left-1'}`}></div>
            </div>
          </label>
          <div className="bg-white px-4 py-1 rounded-full text-sm font-bold text-gray-500 shadow-sm border">
            第 {currentPage + 1} 页 / 共 {totalPages} 页
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-8 border-white flex flex-col md:flex-row min-h-[500px] relative">
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center relative group">
          {book.pages[currentPage].imageUrl ? (
            <img 
              src={book.pages[currentPage].imageUrl} 
              alt={`Illustration for page ${currentPage + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mb-2"></div>
              <p className="text-gray-400 text-sm">插画加载中...</p>
            </div>
          )}
        </div>

        {/* Right Side: Text */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-yellow-50 relative">
          {/* Audio Button */}
          <button
            onClick={handlePlaySpeech}
            disabled={loadingAudio}
            className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all ${
              isPlaying ? 'bg-pink-500 text-white animate-pulse' : 'bg-white text-pink-500 hover:scale-110'
            }`}
          >
            {loadingAudio ? (
              <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <span className="text-xl">⏸</span>
            ) : (
              <span className="text-xl">🔊</span>
            )}
          </button>

          <h2 className="text-2xl font-kids text-pink-600 mb-6 text-center">
            {currentPage === 0 ? book.title : ''}
          </h2>
          <p className="text-xl text-gray-800 leading-relaxed font-medium first-letter:text-4xl first-letter:font-kids first-letter:text-blue-600">
            {book.pages[currentPage].text}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between mt-8 px-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
          disabled={isFirstPage}
          className="bg-white text-blue-500 px-6 py-3 rounded-2xl font-bold shadow-md hover:bg-blue-50 disabled:opacity-50 transition-all border-2 border-blue-100"
        >
          上一页
        </button>
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
          disabled={isLastPage}
          className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold shadow-md hover:bg-blue-600 disabled:opacity-50 transition-all"
        >
          下一页
        </button>
      </div>
    </div>
  );
};

export default BookReader;
