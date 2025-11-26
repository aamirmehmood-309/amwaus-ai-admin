export interface ImageMeta {
  name: string;
  mime: string;
  base64: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

export interface SEOAuditResult {
  titleLengthScore: number;
  metaDescriptionScore: number;
  keywordPresenceScore: number;
  headingStructureQuality: number;
  slugReadabilityScore: number;
  imageAltCompleteness: number;
  externalLinkCount: number;
  internalLinkCount: number;
  readabilityScore: number;
  estimatedWordCount: number;
  canonicalUrlCheck: boolean;
  socialTagsScore: number;
  shortDescriptionScore: number;
  overallSEOGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: { severity: 'high' | 'medium' | 'low'; message: string; id: string }[];
}

export interface SEOFields {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

export interface BlogState {
  id?: string; // Added for CRUD
  title: string;
  category: string;
  shortDescription: string;
  slug: string;
  body: string; // HTML
  tags: string[];
  featuredImage: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  seoFields: SEOFields;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  description: string;
  status?: 'active' | 'inactive';
}

export interface AuditLogEntry {
  id: string;
  action: 'CREATE_DRAFT' | 'UPDATE_DRAFT' | 'PUBLISH' | 'PUBLISH_FAILED' | 'DELETE';
  actor: string;
  timestamp: number;
  diff?: { old?: Partial<BlogState>; new?: Partial<BlogState> };
  seoAudit?: SEOAuditResult;
  liveUrl?: string;
}

export interface PublishPayload {
  blog: BlogState;
  seoAudit: SEOAuditResult;
  images: ImageMeta[];
  auditLog: AuditLogEntry;
}

// Google Search Console Types
export interface GSCSite {
  siteUrl: string;
  permissionLevel: string;
}

export interface GSCQueryRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GSCInspectionResult {
  inspectionResult: {
    indexStatusResult: {
      verdict: 'PASS' | 'FAIL' | 'NEUTRAL';
      coverageState: string;
      lastCrawlTime: string;
      indexingState: 'INDEXING_ALLOWED' | 'BLOCKED_BY_META_TAG' | 'BLOCKED_BY_ROBOTS_TXT' | 'NO_INDEX';
      crawledAs: string;
    }
  }
}

export interface GSCSitemap {
  path: string;
  lastSubmitted: string;
  lastDownloaded: string;
  contents: {
    type: string;
    submitted: number;
    indexed: number;
  }[];
}