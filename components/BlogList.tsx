import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Calendar, FileText, Search, Plus, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogState } from '../types';
import { api } from '../services/api';
import { Button, Card, Input } from './ui/MaterialComponents';
import { clsx } from 'clsx';

interface BlogListProps {
  onEdit: (blog: BlogState) => void;
  onCreate: () => void;
}

const ITEMS_PER_PAGE = 5;

export const BlogList: React.FC<BlogListProps> = ({ onEdit, onCreate }) => {
  const [blogs, setBlogs] = useState<BlogState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAllBlogs();
      setBlogs(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load blogs. Please try again.');
      // Mock data for demo if API fails
      const mock: BlogState[] = Array.from({ length: 12 }).map((_, i) => ({
        id: i.toString(),
        title: `Childcare Tip #${i + 1} for Happy Kids`,
        category: i % 2 === 0 ? 'childcare' : 'education',
        status: i % 3 === 0 ? 'DRAFT' : 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        slug: `tip-${i}`,
        shortDescription: 'Essential tips for keeping kids safe and happy during the months.',
        body: '<p>Content...</p>',
        tags: ['summer', 'safety'],
        featuredImage: null,
        seoFields: { metaTitle: '', metaDescription: '', keywords: [], ogTitle: '', ogDescription: '', ogImage: '', canonicalUrl: '' }
      }));
      setBlogs(mock); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await api.deleteBlog(id);
      setBlogs(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      alert('Failed to delete blog');
    }
  };

  // Filter Logic
  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Posts</h1>
            <p className="text-slate-500 text-sm">Manage your blog content</p>
          </div>
          <Button onClick={onCreate}>
            <Plus size={18} className="mr-2" /> New Post
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-auto flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary-500/20 text-slate-700 placeholder:text-slate-400 focus:outline-none" 
                    placeholder="Search by title or category..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={clsx(
                        "p-2 rounded-md transition-all flex items-center gap-2",
                        viewMode === 'grid' ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                    title="Grid View"
                >
                    <LayoutGrid size={18} />
                    <span className="text-xs font-medium hidden sm:inline">Grid</span>
                </button>
                <button 
                    onClick={() => setViewMode('table')}
                    className={clsx(
                        "p-2 rounded-md transition-all flex items-center gap-2",
                        viewMode === 'table' ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                    title="List View"
                >
                    <ListIcon size={18} />
                    <span className="text-xs font-medium hidden sm:inline">List</span>
                </button>
            </div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                  <motion.div 
                      key="grid"
                      variants={container}
                      initial="hidden"
                      animate="show"
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                  {paginatedBlogs.map((blog) => (
                      <motion.div key={blog.id || blog.slug} variants={item}>
                          <Card className="h-full flex flex-col group cursor-pointer hover:border-primary-200 transition-colors" onClick={() => onEdit(blog)}>
                              <div className="aspect-video bg-slate-100 rounded-lg mb-4 overflow-hidden relative">
                              {blog.featuredImage ? (
                                  <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                                      <FileText size={40} />
                                  </div>
                              )}
                              <div className="absolute top-2 right-2">
                                  <span className={clsx(
                                  "px-2 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md",
                                  blog.status === 'PUBLISHED' ? "bg-green-500/90 text-white" : "bg-slate-500/90 text-white"
                                  )}>
                                  {blog.status}
                                  </span>
                              </div>
                              </div>

                              <div className="flex-1 space-y-2">
                                  <div className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                                      {blog.category}
                                  </div>
                                  <h3 className="font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
                                      {blog.title}
                                  </h3>
                                  <p className="text-sm text-slate-500 line-clamp-2">
                                      {blog.shortDescription || 'No description provided.'}
                                  </p>
                              </div>

                              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-400">
                                  <span className="flex items-center gap-1">
                                      <Calendar size={14} />
                                      {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Unpublished'}
                                  </span>
                                  
                                  <div className="flex gap-2">
                                      <button 
                                      onClick={(e) => { e.stopPropagation(); onEdit(blog); }}
                                      className="p-1.5 hover:bg-primary-50 text-slate-400 hover:text-primary-600 rounded transition-colors"
                                      title="Edit"
                                      >
                                      <Edit2 size={16} />
                                      </button>
                                      <button 
                                      onClick={(e) => handleDelete(blog.id || '', e)}
                                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                                      title="Delete"
                                      >
                                      <Trash2 size={16} />
                                      </button>
                                  </div>
                              </div>
                          </Card>
                      </motion.div>
                  ))}
                  </motion.div>
              ) : (
                  <motion.div
                      key="table"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                  >
                      <Card className="p-0 overflow-hidden">
                          <div className="overflow-x-auto">
                              <table className="w-full text-sm text-left border-collapse">
                                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                      <tr>
                                          <th className="px-6 py-4 w-20">Image</th>
                                          <th className="px-6 py-4">Title</th>
                                          <th className="px-6 py-4 w-32">Category</th>
                                          <th className="px-6 py-4 w-32">Status</th>
                                          <th className="px-6 py-4 w-40">Date</th>
                                          <th className="px-6 py-4 w-24 text-right">Actions</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                      {paginatedBlogs.map((blog) => (
                                          <motion.tr 
                                              key={blog.id || blog.slug}
                                              layoutId={`row-${blog.id || blog.slug}`}
                                              onClick={() => onEdit(blog)}
                                              className="bg-white hover:bg-slate-50 transition-colors cursor-pointer group"
                                          >
                                              <td className="px-6 py-3">
                                                  <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                                                      {blog.featuredImage ? (
                                                          <img src={blog.featuredImage} alt="" className="w-full h-full object-cover" />
                                                      ) : (
                                                          <FileText size={16} className="text-slate-400" />
                                                      )}
                                                  </div>
                                              </td>
                                              <td className="px-6 py-3">
                                                  <div className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                                                      {blog.title}
                                                  </div>
                                                  <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                                      {blog.shortDescription}
                                                  </div>
                                              </td>
                                              <td className="px-6 py-3">
                                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 capitalize border border-primary-100">
                                                      {blog.category}
                                                  </span>
                                              </td>
                                              <td className="px-6 py-3">
                                                  <span className={clsx(
                                                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                                      blog.status === 'PUBLISHED' 
                                                          ? "bg-green-50 text-green-700 border-green-100" 
                                                          : "bg-slate-100 text-slate-600 border-slate-200"
                                                  )}>
                                                      <span className={clsx("w-1.5 h-1.5 rounded-full", blog.status === 'PUBLISHED' ? "bg-green-500" : "bg-slate-400")} />
                                                      {blog.status}
                                                  </span>
                                              </td>
                                              <td className="px-6 py-3 text-slate-500 text-xs">
                                                  {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '-'}
                                              </td>
                                              <td className="px-6 py-3 text-right">
                                                  <div className="flex items-center justify-end gap-2">
                                                      <button 
                                                          onClick={(e) => { e.stopPropagation(); onEdit(blog); }}
                                                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                                          title="Edit"
                                                      >
                                                          <Edit2 size={16} />
                                                      </button>
                                                      <button 
                                                          onClick={(e) => handleDelete(blog.id || '', e)}
                                                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                          title="Delete"
                                                      >
                                                          <Trash2 size={16} />
                                                      </button>
                                                  </div>
                                              </td>
                                          </motion.tr>
                                      ))}
                                  </tbody>
                              </table>
                              {filteredBlogs.length === 0 && (
                                  <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
                                      <Search size={32} className="text-slate-300" />
                                      <p>No blogs found matching your search.</p>
                                  </div>
                              )}
                          </div>
                      </Card>
                  </motion.div>
              )}
          </AnimatePresence>

          {/* Pagination Controls */}
          {totalPages > 1 && (
             <div className="flex justify-between items-center mt-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent text-slate-600 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-1">
                   {Array.from({ length: totalPages }).map((_, i) => (
                     <button
                       key={i}
                       onClick={() => setCurrentPage(i + 1)}
                       className={clsx(
                         "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                         currentPage === i + 1 
                           ? "bg-primary-600 text-white shadow-sm" 
                           : "text-slate-600 hover:bg-slate-100"
                       )}
                     >
                       {i + 1}
                     </button>
                   ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent text-slate-600 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
             </div>
          )}
        </>
      )}
    </div>
  );
};