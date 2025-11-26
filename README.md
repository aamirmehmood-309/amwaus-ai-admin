# Lumina Blog Admin

Run: `npm install && npm run dev`

## Features
- **Rich Text Editor**: TipTap based with Code View toggle.
- **Image Handling**: Client-side resizing (max 1600px) + Base64 fallback.
- **SEO Audit**: Real-time content analysis (Title, Meta, Alt tags, Keywords).
- **Animations**: Framer Motion for premium feel.
- **API**: Posts to `/api/blog/store_blog_content`.

## Configuration
- **API Proxy**: Edit `vite.config.ts` to point `/api` to your actual backend.
- **Image Upload**: Currently falls back to Base64. To enable server upload, modify `components/RichEditor.tsx` `handleImageUpload` function to POST to your upload endpoint instead of calling `processImage`.