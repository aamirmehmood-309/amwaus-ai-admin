import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Globe, Eye, Image as ImageIcon, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { BlogState, SEOAuditResult, ImageMeta, PublishPayload } from '../types';
import { calculateSEOScore } from '../utils/seoAudit';
import { RichEditor } from './RichEditor';
import { SEOCard } from './SEOCard';
import { Button, Input, Card, Label } from './ui/MaterialComponents';
import { api } from '../services/api';
import { clsx } from 'clsx';

const INITIAL_STATE: BlogState = {
  title: '',
  category: 'childcare',
  shortDescription: '',
  slug: '',
  body: '<p></p>',
  tags: [],
  featuredImage: null,
  status: 'DRAFT',
  publishedAt: null,
  seoFields: {
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    keywords: [],
    ogTitle: '',
    ogDescription: '',
    ogImage: ''
  }
};

interface BlogEditorProps {
  initialData?: BlogState | null;
  onBack: () => void;
  onSaveSuccess?: () => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({ initialData, onBack, onSaveSuccess }) => {
  const [blog, setBlog] = useState<BlogState>(initialData || INITIAL_STATE);
  const [seoAudit, setSeoAudit] = useState<SEOAuditResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [collectedImages, setCollectedImages] = useState<ImageMeta[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const [notification, setNotification] = useState<{type: 'success'|'error', msg: string} | null>(null);

  // Initialize from props if changed
  useEffect(() => {
    if (initialData) {
      setBlog(initialData);
    }
  }, [initialData]);

  // Autosave Logic (Local)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (blog.title && blog.status === 'DRAFT') {
        setIsSaving(true);
        localStorage.setItem('draft_blog', JSON.stringify(blog));
        setTimeout(() => {
          setIsSaving(false);
          setLastSaved(new Date());
        }, 800);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [blog]);

  // Live SEO Analysis
  useEffect(() => {
    const audit = calculateSEOScore(blog);
    setSeoAudit(audit);
  }, [blog.title, blog.body, blog.shortDescription, blog.seoFields]);

  const handleSlugGen = () => {
    if (!blog.slug && blog.title) {
      const slug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setBlog(prev => ({ ...prev, slug }));
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const audit = calculateSEOScore(blog);
    
    const payload: PublishPayload = {
      blog: {
        ...blog,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString()
      },
      seoAudit: audit,
      images: collectedImages,
      auditLog: {
        id: crypto.randomUUID(),
        action: 'PUBLISH',
        actor: 'admin',
        timestamp: Date.now(),
        liveUrl: `/blog/${blog.slug}`,
        seoAudit: audit
      }
    };

    try {
      await api.storeBlog(payload);
      setNotification({ type: 'success', msg: 'Blog published successfully!' });
      localStorage.removeItem('draft_blog');
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', msg: 'Failed to publish. Check console.' });
    } finally {
      setIsPublishing(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 sticky top-20 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
             <ArrowLeft size={18} className="mr-1" /> Back
          </Button>
          <div className="h-6 w-px bg-slate-300 mx-2" />
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            {isSaving ? (
              <span className="flex items-center gap-1 text-primary-600"><div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" /> Saving...</span>
            ) : lastSaved ? (
              <span>Draft saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            ) : (
                <span>Unsaved changes</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
             <Button variant="secondary" size="sm" onClick={() => window.print()}>
               <Eye size={16} className="mr-2" /> Preview
             </Button>
             <Button variant="primary" size="sm" onClick={handlePublish} isLoading={isPublishing}>
               <Globe size={16} className="mr-2" /> {blog.status === 'PUBLISHED' ? 'Update' : 'Publish'}
             </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Editor */}
        <div className="flex-1 space-y-6 min-w-0">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    placeholder="Enter blog post title..." 
                    className="w-full text-4xl font-extrabold text-slate-900 placeholder:text-slate-300 border-none focus:ring-0 p-0 bg-transparent"
                    value={blog.title}
                    onChange={(e) => setBlog({...blog, title: e.target.value})}
                    onBlur={handleSlugGen}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                     <span className="text-slate-400 text-sm">/blog/</span>
                     <Input 
                        value={blog.slug} 
                        onChange={(e) => setBlog({...blog, slug: e.target.value})}
                        className="h-8 text-sm"
                     />
                  </div>
                  <div>
                    <select 
                      className="w-full h-8 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-primary-500"
                      value={blog.category}
                      onChange={(e) => setBlog({...blog, category: e.target.value})}
                    >
                      <option value="childcare">Childcare</option>
                      <option value="daycare">Daycare</option>
                      <option value="education">Education</option>
                      <option value="parenting">Parenting Tips</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <RichEditor 
                  content={blog.body} 
                  onChange={(html) => setBlog({...blog, body: html})}
                  onImageAdd={(img) => setCollectedImages(prev => [...prev, img])}
                />
              </div>
            </Card>
          </motion.div>

          {/* Additional Fields */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
             <Card>
                <div className="flex items-center gap-4 mb-4 border-b border-slate-100 pb-2">
                   <button 
                    onClick={() => setActiveTab('content')}
                    className={clsx("pb-2 font-medium text-sm transition-colors", activeTab === 'content' ? "text-primary-600 border-b-2 border-primary-600" : "text-slate-500")}
                   >
                     Content Settings
                   </button>
                   <button 
                    onClick={() => setActiveTab('seo')}
                    className={clsx("pb-2 font-medium text-sm transition-colors", activeTab === 'seo' ? "text-primary-600 border-b-2 border-primary-600" : "text-slate-500")}
                   >
                     SEO Metadata
                   </button>
                </div>

                {activeTab === 'content' ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Short Description ({blog.shortDescription.length}/160)</Label>
                      <textarea 
                        className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-primary-500"
                        rows={3}
                        value={blog.shortDescription}
                        onChange={(e) => setBlog({...blog, shortDescription: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Tags (comma separated)</Label>
                      <Input 
                        placeholder="e.g. toddlers, summer, safety"
                        value={blog.tags.join(', ')}
                        onChange={(e) => setBlog({...blog, tags: e.target.value.split(',').map(s => s.trim())})}
                      />
                    </div>
                  </div>
                ) : (
                   <div className="space-y-4">
                      <div>
                        <Label>Meta Title</Label>
                        <Input 
                          value={blog.seoFields.metaTitle} 
                          onChange={(e) => setBlog({...blog, seoFields: {...blog.seoFields, metaTitle: e.target.value}})}
                        />
                      </div>
                      <div>
                        <Label>Meta Description</Label>
                        <textarea
                          className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-primary-500"
                          rows={3}
                          placeholder="Ideally 150-160 characters for search engines."
                          value={blog.seoFields.metaDescription} 
                          onChange={(e) => setBlog({...blog, seoFields: {...blog.seoFields, metaDescription: e.target.value}})}
                        />
                        <div className="text-xs text-right mt-1 text-slate-400">
                            {blog.seoFields.metaDescription.length} chars
                        </div>
                      </div>
                      <div>
                        <Label>Keywords</Label>
                        <Input 
                          placeholder="primary keyword, secondary..."
                          value={blog.seoFields.keywords.join(', ')} 
                          onChange={(e) => setBlog({...blog, seoFields: {...blog.seoFields, keywords: e.target.value.split(',').map(s => s.trim())}})}
                        />
                      </div>
                      <div>
                        <Label>Canonical URL</Label>
                        <Input 
                          placeholder="https://..."
                          value={blog.seoFields.canonicalUrl} 
                          onChange={(e) => setBlog({...blog, seoFields: {...blog.seoFields, canonicalUrl: e.target.value}})}
                        />
                      </div>
                   </div>
                )}
             </Card>
          </motion.div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className="space-y-6">
            <SEOCard audit={seoAudit} onRefresh={() => setSeoAudit(calculateSEOScore(blog))} />

            <Card>
              <h3 className="font-bold text-slate-800 mb-4">Publishing</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className={clsx("font-medium px-2 py-0.5 rounded text-xs", blog.status === 'PUBLISHED' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600")}>
                    {blog.status}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-slate-800 mb-4">Featured Image</h3>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group overflow-hidden">
                {blog.featuredImage ? (
                   <img src={blog.featuredImage} className="w-full h-32 object-cover rounded" alt="Featured" />
                ) : (
                  <div className="py-8">
                    <ImageIcon className="mx-auto text-slate-400 mb-2" />
                    <span className="text-xs text-slate-500">Click to upload</span>
                  </div>
                )}
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if(f) {
                       const url = URL.createObjectURL(f);
                       setBlog({...blog, featuredImage: url});
                    }
                  }} 
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={clsx(
              "fixed bottom-8 right-8 p-4 rounded-lg shadow-xl flex items-center gap-3 text-white z-50 font-medium",
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            )}
          >
            {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};