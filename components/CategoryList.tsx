import React, { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Search, Plus, Tag, Check, X as XIcon } from 'lucide-react';
import { Category } from '../types';
import { api } from '../services/api';
import { Button, Card, Input, Modal, Label } from './ui/MaterialComponents';
import { clsx } from 'clsx';

export const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({ name: ''});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      // Fallback mock data if API fails
      setCategories([
        { id: '1', name: 'Childcare' },
        { id: '2', name: 'Parenting'},
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData(category);
    } else {
      setEditingCategory(null);
      setFormData({ name: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        id: editingCategory?.id
      } as Category;

      await api.storeCategory(payload);
      await loadCategories(); // Reload to get fresh list
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save category', error);
      alert('Failed to save category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  // Auto-generate slug
  useEffect(() => {
    if (!editingCategory && formData.name) {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, editingCategory]);

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
            <p className="text-slate-500 text-sm">Organize your content structure</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={18} className="mr-2" /> New Category
          </Button>
        </div>

        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm max-w-md w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary-500/20 text-slate-700 placeholder:text-slate-400 focus:outline-none" 
                    placeholder="Search categories..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
             <div className="p-12 text-center text-slate-400">Loading categories...</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            {/* <th className="px-6 py-4">Slug</th> */}
                            {/* <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Status</th> */}
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCategories.map((cat) => (
                            <tr key={cat.id} className="bg-white hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-3 font-medium text-slate-900">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                                            <Tag size={16} />
                                        </div>
                                        {cat.name}
                                    </div>
                                </td>
                                {/* <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                                    {cat.slug}
                                </td>
                                <td className="px-6 py-3 text-slate-500 max-w-xs truncate">
                                    {cat.description || '-'}
                                </td>
                                <td className="px-6 py-3">
                                    <span className={clsx(
                                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                        cat.status === 'active' ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {cat.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </td> */}
                                <td className="px-6 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                        disabled
                                            onClick={() => handleOpenModal(cat)}
                                            className="cursor-not-allowed p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                        disabled
                                            onClick={() => handleDelete(cat.id!)}
                                            className="cursor-not-allowed p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {filteredCategories.length === 0 && (
                             <tr>
                                 <td colSpan={5} className="text-center py-12 text-slate-500">
                                     No categories found.
                                 </td>
                             </tr>
                         )}
                    </tbody>
                </table>
            </div>
        )}
      </Card>

      {/* Edit/Create Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCategory ? 'Edit Category' : 'New Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
            <div>
                <Label>Category Name</Label>
                <Input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Health & Safety"
                />
            </div>
            {/* <div>
                <Label>Slug</Label>
                <Input 
                    required 
                    value={formData.slug} 
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    placeholder="e.g. health-safety"
                />
            </div> */}
            {/* <div>
                <Label>Description</Label>
                <textarea 
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of this category..."
                />
            </div> */}
            {/* <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="status"
                    checked={formData.status === 'active'}
                    onChange={e => setFormData({...formData, status: e.target.checked ? 'active' : 'inactive'})}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                />
                <label htmlFor="status" className="text-sm text-slate-700 font-medium">Active</label>
            </div> */}
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={isSaving}>Save Category</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};