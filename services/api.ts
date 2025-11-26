import { BlogState, PublishPayload, Category } from '../types';

// Using relative path to utilize Vite proxy
const BASE_URL = 'https://devian.amwaus.com/'; 

// Helper to map Backend JSON -> Frontend State
const mapApiToBlog = (data: any): BlogState => {
  return {
    id: data.id?.toString(),
    title: data.title || '',
    category: data.category_name || data.category || 'Uncategorized',
    shortDescription: data.short_description || '', // Maps snake_case to camelCase
    slug: data.slug || '',
    body: data.content || '',
    tags: data.tags ? (Array.isArray(data.tags) ? data.tags : data.tags.split(',')) : [],
    featuredImage: data.blog_img 
      ? (data.blog_img.startsWith('http') ? data.blog_img : `https://devian.amwaus.com/${data.blog_img}`) 
      : null,
    status: (data.status === 'true' || data.status === true || data.status === 'PUBLISHED') ? 'PUBLISHED' : 'DRAFT',
    publishedAt: data.created_at || data.Timestamp || null,
    seoFields: {
      metaTitle: data.meta_title || '',
      metaDescription: data.meta_description || '',
      canonicalUrl: data.canonical_url || '',
      keywords: data.keywords ? (Array.isArray(data.keywords) ? data.keywords : data.keywords.split(',')) : [],
      ogTitle: data.og_title || '',
      ogDescription: data.og_description || '',
      ogImage: data.og_image || ''
    }
  };
};

const mapApiToCategory = (data: any): Category => {
  return {
    id: data.id?.toString(),
    name: data.category_name || data.name || '',
    slug: data.slug || '',
    description: data.description || '',
    status: data.status === 1 || data.status === '1' || data.status === true ? 'active' : 'inactive'
  };
};

export const api = {
  /**
   * Fetch all blogs
   * Endpoint: /api/blog/get_all_blogs
   */
  getAllBlogs: async (): Promise<BlogState[]> => {
    try {
      const response = await fetch(`${BASE_URL}api/blog/get_all_blogs`);
      if (!response.ok) throw new Error('Failed to fetch blogs');
      const data = await response.json();
      
      const rawList = Array.isArray(data) ? data : (data.data || []);
      return rawList.map(mapApiToBlog);
    } catch (error) {
      console.error("API Error:", error);
      return [];
    }
  },

  /**
   * Fetch a single blog by ID
   */
  getBlogById: async (id: string): Promise<BlogState> => {
    const response = await fetch(`${BASE_URL}api/blog/get_blog?id=${id}`);
    if (!response.ok) throw new Error('Failed to fetch blog');
    const data = await response.json();
    return mapApiToBlog(data);
  },

  /**
   * Store/Update blog content
   * Endpoint: /api/blog/store_blog_content
   */
  storeBlog: async (payload: PublishPayload): Promise<BlogState> => {
    // We might need to map it back to snake_case for the server, 
    // but typically modern endpoints might accept JSON. 
    // If the server expects form-data or specific keys, we would adjust here.
    const response = await fetch(`${BASE_URL}api/blog/store_blog_content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to save blog');
    const data = await response.json();
    return mapApiToBlog(data);
  },

  /**
   * Delete a blog
   * Endpoint: /api/blog/delete_blog
   */
  deleteBlog: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}api/blog/delete_blog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!response.ok) throw new Error('Failed to delete blog');
  },

  // --- Category Endpoints ---

  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await fetch(`${BASE_URL}api/blogCategory/get_blog_category`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      const rawList = Array.isArray(data) ? data : (data.data || []);
      return rawList.map(mapApiToCategory);
    } catch (error) {
      console.error("API Error Categories:", error);
      return [];
    }
  },

  storeCategory: async (category: Category): Promise<Category> => {
    const payload = {
        id: category.id,
        category_name: category.name,
        slug: category.slug,
        description: category.description,
        status: category.status === 'active' ? 1 : 0
    };
    
    const response = await fetch(`${BASE_URL}api/blogCategory/store_blog_category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to save category');
    const data = await response.json();
    return mapApiToCategory(data);
  },

  deleteCategory: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}api/blogCategory/delete_blog_category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!response.ok) throw new Error('Failed to delete category');
  }
};