import { BlogState, SEOAuditResult } from '../types';

export const calculateSEOScore = (blog: BlogState): SEOAuditResult => {
  const issues: SEOAuditResult['issues'] = [];
  let scoreAccumulator = 0;

  // Safety checks for potentially undefined fields
  const title = blog.title || '';
  const shortDescription = blog.shortDescription || '';
  const body = blog.body || '';
  const seoFields = blog.seoFields || { 
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    keywords: [],
    ogTitle: '',
    ogDescription: '',
    ogImage: ''
  };

  // 1. Title Length (Optimal: 40-60 chars)
  const titleLen = title.length;
  let titleScore = 100;
  if (titleLen < 10) { titleScore = 20; issues.push({ severity: 'high', message: 'Title is too short.', id: 'title-short' }); }
  else if (titleLen > 70) { titleScore = 60; issues.push({ severity: 'medium', message: 'Title is too long, might get truncated.', id: 'title-long' }); }
  scoreAccumulator += titleScore;

  // 2. Short Description (Optimal: 120-160 chars)
  const descLen = shortDescription.length;
  let descScore = 100;
  if (descLen < 50) { descScore = 40; issues.push({ severity: 'medium', message: 'Short description is too thin.', id: 'desc-short' }); }
  else if (descLen > 160) { descScore = 80; issues.push({ severity: 'low', message: 'Short description exceeds 160 chars.', id: 'desc-long' }); }
  scoreAccumulator += descScore;

  // 3. Image Alt Text
  const imgTags: string[] = (body.match(/<img[^>]+>/g) || []);
  const imgsWithAlt = imgTags.filter(img => img.includes('alt=') && !img.includes('alt=""'));
  const altScore = imgTags.length === 0 ? 100 : Math.round((imgsWithAlt.length / imgTags.length) * 100);
  if (altScore < 100 && imgTags.length > 0) {
    issues.push({ severity: 'high', message: `${imgTags.length - imgsWithAlt.length} images missing alt text.`, id: 'img-alt' });
  }
  scoreAccumulator += altScore;

  // 4. Word Count
  const textContent = body.replace(/<[^>]*>/g, ' ');
  const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
  let readabilityScore = 100;
  if (wordCount < 300) {
    readabilityScore = 50;
    issues.push({ severity: 'high', message: 'Content is too short for SEO ranking (aim for 300+ words).', id: 'word-count' });
  }
  scoreAccumulator += readabilityScore;

  // 5. Keyword Presence
  const keywords = seoFields.keywords || [];
  let keywordScore = 100;
  if (keywords.length > 0) {
    const missingKeywords = keywords.filter(k => !textContent.toLowerCase().includes(k.toLowerCase()));
    if (missingKeywords.length > 0) {
      keywordScore = Math.max(0, 100 - (missingKeywords.length * 20));
      issues.push({ severity: 'medium', message: `Missing keywords in body: ${missingKeywords.join(', ')}`, id: 'keywords' });
    }
  } else {
    keywordScore = 50;
    issues.push({ severity: 'low', message: 'No focus keywords defined.', id: 'no-keywords' });
  }
  scoreAccumulator += keywordScore;

  // Calculate Average
  const average = scoreAccumulator / 5;
  let grade: SEOAuditResult['overallSEOGrade'] = 'F';
  if (average >= 90) grade = 'A';
  else if (average >= 80) grade = 'B';
  else if (average >= 70) grade = 'C';
  else if (average >= 60) grade = 'D';

  return {
    titleLengthScore: titleScore,
    metaDescriptionScore: descScore,
    imageAltCompleteness: altScore,
    estimatedWordCount: wordCount,
    keywordPresenceScore: keywordScore,
    headingStructureQuality: 100, // Simplified
    slugReadabilityScore: 100, // Simplified
    externalLinkCount: 0,
    internalLinkCount: 0,
    readabilityScore,
    canonicalUrlCheck: !!seoFields.canonicalUrl,
    socialTagsScore: 100,
    shortDescriptionScore: descScore,
    overallSEOGrade: grade,
    issues,
  };
};