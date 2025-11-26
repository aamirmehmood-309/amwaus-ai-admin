import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, List, Settings, BarChart2, Palette, Tags, Search } from 'lucide-react';
import { BlogState } from './types';
import { BlogEditor } from './components/BlogEditor';
import { BlogList } from './components/BlogList';
import { CategoryList } from './components/CategoryList';
import { Dashboard } from './components/Dashboard';
import { SEODashboard } from './components/SEODashboard';
import { clsx } from 'clsx';

type View = 'dashboard' | 'list' | 'editor' | 'categories' | 'seo-dashboard';

const THEMES = [
  { name: 'Indigo', color: 'bg-indigo-600', values: { 50: '238 242 255', 100: '224 231 255', 500: '99 102 241', 600: '79 70 229', 700: '67 56 202' } },
  { name: 'Teal', color: 'bg-teal-600', values: { 50: '240 253 250', 100: '204 251 241', 500: '20 184 166', 600: '13 148 136', 700: '15 118 110' } },
  { name: 'Rose', color: 'bg-rose-600', values: { 50: '255 241 242', 100: '255 228 230', 500: '244 63 94', 600: '225 29 72', 700: '190 18 60' } },
  { name: 'Blue', color: 'bg-blue-600', values: { 50: '239 246 255', 100: '219 234 254', 500: '59 130 246', 600: '37 99 235', 700: '29 78 216' } },
];

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedBlog, setSelectedBlog] = useState<BlogState | null>(null);
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);

  useEffect(() => {
    // Apply theme vars
    const root = document.documentElement;
    Object.entries(currentTheme.values).forEach(([key, value]) => {
      root.style.setProperty(`--primary-${key}`, value);
    });
  }, [currentTheme]);

  const handleEdit = (blog: BlogState) => {
    setSelectedBlog(blog);
    setCurrentView('editor');
  };

  const handleCreate = () => {
    setSelectedBlog(null); // Clear selection for new blog
    setCurrentView('editor');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedBlog(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col z-50 transition-transform lg:translate-x-0 -translate-x-full lg:static shadow-2xl">
        <div className="p-6 flex items-center gap-3 text-white border-b border-slate-800">
           <div className="bg-primary-600 rounded-lg p-1.5 transition-colors">
              <Layout size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight">Lumina<span className="text-primary-500 transition-colors">CMS</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs uppercase font-bold text-slate-500 px-3 mb-2">Analytics</div>

          <button 
            onClick={() => setCurrentView('dashboard')}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
              currentView === 'dashboard' ? "bg-primary-600 text-white shadow-lg shadow-primary-900/20" : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <BarChart2 size={18} />
            <span className="font-medium">Dashboard</span>
          </button>

          <button 
            onClick={() => setCurrentView('seo-dashboard')}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
              currentView === 'seo-dashboard' ? "bg-primary-600 text-white shadow-lg shadow-primary-900/20" : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <Search size={18} />
            <span className="font-medium">SEO Indexing</span>
          </button>

          <div className="text-xs uppercase font-bold text-slate-500 px-3 mt-8 mb-2">Content</div>
          
          <button 
            onClick={() => setCurrentView('list')}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
              currentView === 'list' ? "bg-primary-600 text-white shadow-lg shadow-primary-900/20" : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <List size={18} />
            <span className="font-medium">All Posts</span>
          </button>

          <button 
            onClick={() => setCurrentView('categories')}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
              currentView === 'categories' ? "bg-primary-600 text-white shadow-lg shadow-primary-900/20" : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <Tags size={18} />
            <span className="font-medium">Categories</span>
          </button>

          <div className="text-xs uppercase font-bold text-slate-500 px-3 mt-8 mb-2">System</div>
          
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-slate-400">
            <Settings size={18} />
            <span className="font-medium">Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto flex flex-col">
        {/* Top Bar with Theme Switcher */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 h-16 flex items-center justify-between">
            <div className="font-bold text-slate-900 lg:hidden">Lumina CMS</div>
            <div className="hidden lg:block text-slate-500 text-sm">Welcome back, Admin</div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 rounded-full p-1 pr-3">
                <Palette size={16} className="text-slate-400 ml-2" />
                <div className="flex gap-1">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => setCurrentTheme(theme)}
                      className={clsx(
                        "w-5 h-5 rounded-full transition-transform hover:scale-110",
                        theme.color,
                        currentTheme.name === theme.name && "ring-2 ring-offset-2 ring-slate-300 scale-110"
                      )}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>
            </div>
        </header>

        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
               <motion.div 
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Dashboard />
              </motion.div>
            )}
            {currentView === 'seo-dashboard' && (
              <motion.div 
                key="seo-dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <SEODashboard />
              </motion.div>
            )}
            {currentView === 'list' && (
              <motion.div 
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <BlogList onEdit={handleEdit} onCreate={handleCreate} />
              </motion.div>
            )}
            {currentView === 'categories' && (
              <motion.div 
                key="categories"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <CategoryList />
              </motion.div>
            )}
            {currentView === 'editor' && (
              <motion.div 
                key="editor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <BlogEditor 
                  initialData={selectedBlog} 
                  onBack={handleBackToList}
                  onSaveSuccess={handleBackToList}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}