
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import StoryForm from './components/StoryForm';
import BookReader from './components/BookReader';
import HistoryList from './components/HistoryList';
import LoadingScreen from './components/LoadingScreen';
import { Book, ArtStyle } from './types';
import { generateStoryStructure, generatePageImage } from './services/geminiService';

const MainApp: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('magic_books');
    if (saved) {
      setBooks(JSON.parse(saved));
    }
  }, []);

  const saveBook = (newBook: Book) => {
    const updated = [newBook, ...books];
    setBooks(updated);
    localStorage.setItem('magic_books', JSON.stringify(updated));
  };

  const deleteBook = (id: string) => {
    const updated = books.filter(b => b.id !== id);
    setBooks(updated);
    localStorage.setItem('magic_books', JSON.stringify(updated));
  };

  const handleCreateStory = async (topic: string, style: ArtStyle) => {
    setIsGenerating(true);
    setLoadingMessage("正在为您的故事撒下魔法粉末...");
    
    try {
      // 1. Generate Structure
      const structure = await generateStoryStructure(topic, style);
      setLoadingMessage("正在为您绘制精美的插图...");

      // 2. Generate Images in Parallel
      const imagePromises = structure.pages.map((p, idx) => 
        generatePageImage(p.imagePrompt, structure.characterBible, style)
          .catch(() => `https://picsum.photos/800/600?random=${idx}`) // Fallback
      );

      const images = await Promise.all(imagePromises);

      const newBook: Book = {
        id: crypto.randomUUID(),
        title: structure.title,
        author: "MagicBook AI",
        style,
        characterBible: structure.characterBible,
        createdAt: Date.now(),
        pages: structure.pages.map((p, i) => ({
          id: i,
          text: p.text,
          imagePrompt: p.imagePrompt,
          imageUrl: images[i]
        }))
      };

      saveBook(newBook);
      setIsGenerating(false);
      navigate(`/book/${newBook.id}`);
    } catch (error) {
      console.error(error);
      alert("哎呀！魔法暂时失灵了，请再试一次。");
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isGenerating && <LoadingScreen message={loadingMessage} />}
        <Routes>
          <Route path="/" element={
            <div className="space-y-12">
              <StoryForm onSubmit={handleCreateStory} isLoading={isGenerating} />
              <HistoryList books={books} onDelete={deleteBook} />
            </div>
          } />
          <Route path="/book/:id" element={<BookReader books={books} />} />
        </Routes>
      </main>
      <footer className="bg-yellow-100 py-6 text-center text-yellow-700 font-semibold border-t border-yellow-200">
        <p>为小小梦想家倾情打造 ❤️</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <MainApp />
    </HashRouter>
  );
};

export default App;
