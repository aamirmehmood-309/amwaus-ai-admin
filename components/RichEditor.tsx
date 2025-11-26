import React, { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Image as ImageIcon, Link as LinkIcon, Code, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';
import { Button } from './ui/MaterialComponents';
import { processImage } from '../utils/imageHandler';

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  onImageAdd?: (img: any) => void;
}

const ToolbarButton = ({ onClick, isActive, icon: Icon, title }: any) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded hover:bg-slate-100 transition-colors ${isActive ? 'text-primary-600 bg-primary-50' : 'text-slate-600'}`}
  >
    <Icon size={18} />
  </button>
);

export const RichEditor: React.FC<RichEditorProps> = ({ content, onChange, onImageAdd }) => {
  const [isCodeView, setIsCodeView] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Youtube,
      Placeholder.configure({ placeholder: 'Start writing your amazing story...' }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[300px]',
      },
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      try {
        const processed = await processImage(file);
        // Strategy A: Base64 fallback immediately for preview
        editor.chain().focus().setImage({ src: processed.base64, alt: processed.name }).run();
        if (onImageAdd) onImageAdd(processed);
      } catch (err) {
        console.error("Image processing failed", err);
      }
    }
  };

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50/50 p-2">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={Bold} title="Bold" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={Italic} title="Italic" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={UnderlineIcon} title="Underline" />
        
        <div className="w-px h-6 bg-slate-300 mx-2" />
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={Type} title="H2" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} title="Left" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} title="Center" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} icon={AlignRight} title="Right" />

        <div className="w-px h-6 bg-slate-300 mx-2" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={List} title="Bullet List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} icon={Quote} title="Quote" />

        <div className="w-px h-6 bg-slate-300 mx-2" />

        <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} icon={LinkIcon} title="Link" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded hover:bg-slate-100 text-slate-600 transition-colors"
          title="Insert Image"
        >
          <ImageIcon size={18} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />

        <div className="flex-1" />
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsCodeView(!isCodeView)}
          className="ml-auto font-mono text-xs"
        >
          <Code size={14} className="mr-1" />
          {isCodeView ? 'WYSIWYG' : 'HTML'}
        </Button>
      </div>

      {/* Editor Surface */}
      <div className="relative min-h-[400px]">
        {isCodeView ? (
          <textarea
            className="w-full h-full min-h-[400px] p-4 font-mono text-sm bg-slate-900 text-slate-100 resize-y focus:outline-none"
            value={content}
            onChange={(e) => {
              onChange(e.target.value);
              editor.commands.setContent(e.target.value);
            }}
          />
        ) : (
          <EditorContent editor={editor} className="p-6" />
        )}
      </div>
    </div>
  );
};