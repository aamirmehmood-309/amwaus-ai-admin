import { BlogState, PublishPayload, Category } from '../types';

// Using relative path to utilize Vite proxy
const BASE_URL = 'https://devian.amwaus.com/'; 

// Helper to map Backend JSON -> Frontend State
const mapApiToBlog = (data: any): BlogState => {
  return {
    id: data.id?.toString(),
    title: data.title || '',
    categoryId: data.category_id?.toString() || '', // Map category_id
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
    const response = await fetch(`${BASE_URL}api/blog/get_blog_content/${id}`);
    if (!response.ok) throw new Error('Failed to fetch blog');
    const data = await response.json();
    const blogData = (data.id || data.title) ? data : (data.data || data);
    return mapApiToBlog(blogData);
  },

  /**
   * Store/Update blog content
   * Endpoint: /api/blog/store_blog_content (Create) OR /api/blog/update_blog_content/:id (Update)
   */
  storeBlog: async (payload: PublishPayload): Promise<BlogState> => {
    let endpoint = `${BASE_URL}api/blog/store_blog_content`;
    
    // Check if we are updating an existing blog
    if (payload.blog.id) {
        endpoint = `${BASE_URL}api/blog/update_blog_content/${payload.blog.id}`;
    }

    // Transform payload to match backend validation structure if needed
    // But based on "use this validation object", the backend likely expects these keys in the body
    const backendPayload = {
        title: payload.blog.title,
        short_description: payload.blog.shortDescription,
        meta_title: payload.blog.seoFields.metaTitle,
        meta_description: payload.blog.seoFields.metaDescription,
        content: payload.blog.body,
        blog_img: payload.blog.featuredImage, // Note: If this is base64, ensure backend handles it. 
        slug: payload.blog.slug,
        author_id: 1, // Hardcoded or from auth context
        category_id: payload.blog.categoryId,
        keywords: payload.blog.seoFields.keywords.join(','),
        status: payload.blog.status === 'PUBLISHED' ? 'true' : 'false',
        // Include other fields if necessary
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend Validation Error:", errorData);
        throw new Error(errorData.message || 'Failed to save blog');
    }
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