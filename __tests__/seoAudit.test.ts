import { describe, it, expect } from 'vitest';
import { calculateSEOScore } from '../utils/seoAudit';
import { BlogState } from '../types';

const MOCK_BLOG: BlogState = {
  title: 'A Very Good Title For SEO Purposes That Is Neither Too Long Nor Too Short',
  category: 'childcare',
  shortDescription: 'This is a perfect length description that sits right between 120 and 160 characters to ensure that the search engine optimizers are happy with the result we provide.',
  slug: 'good-title',
  body: '<p>This is some content that is definitely shorter than 300 words.</p>',
  tags: [],
  featuredImage: null,
  status: 'DRAFT',
  publishedAt: null,
  seoFields: {
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    keywords: ['content'],
    ogTitle: '',
    ogDescription: '',
    ogImage: ''
  }
};

describe('calculateSEOScore', () => {
  it('should penalize short word count', () => {
    const result = calculateSEOScore(MOCK_BLOG);
    expect(result.estimatedWordCount).toBeLessThan(300);
    expect(result.overallSEOGrade).not.toBe('A');
    expect(result.issues.some(i => i.id === 'word-count')).toBe(true);
  });

  it('should detect missing keywords', () => {
    const badBlog = { ...MOCK_BLOG, seoFields: { ...MOCK_BLOG.seoFields, keywords: ['banana'] } };
    const result = calculateSEOScore(badBlog);
    expect(result.keywordPresenceScore).toBeLessThan(100);
  });
});