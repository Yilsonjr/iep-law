import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { useEffect } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Heading2, Heading3,
  Link as LinkIcon, Undo, Redo, Quote,
  AlignLeft, AlignCenter, AlignRight,
  Minus, Code,
} from 'lucide-react';
import { cn } from '../utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

function Btn({
  onClick, active, title, children,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors',
        active ? 'bg-primary text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-stone-200 mx-1 self-center" />;
}

export function RichTextEditor({
  value, onChange, placeholder = 'Escribe aquí...', className, minHeight = '220px',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external value changes (e.g. loading an existing page for editing)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const addLink = () => {
    const prev = editor.getAttributes('link').href as string ?? '';
    const url = prompt('URL del enlace:', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className={cn('border border-stone-200 rounded-xl overflow-hidden bg-white', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-stone-200 bg-stone-50">
        {/* Text style */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrita (Ctrl+B)">
          <Bold size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Cursiva (Ctrl+I)">
          <Italic size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Subrayado (Ctrl+U)">
          <UnderlineIcon size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Tachado">
          <Strikethrough size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Código inline">
          <Code size={15} />
        </Btn>

        <Sep />

        {/* Headings */}
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título H2">
          <Heading2 size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Título H3">
          <Heading3 size={15} />
        </Btn>

        <Sep />

        {/* Lists */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista con viñetas">
          <List size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">
          <ListOrdered size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Cita">
          <Quote size={15} />
        </Btn>

        <Sep />

        {/* Alignment */}
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Alinear izquierda">
          <AlignLeft size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centrar">
          <AlignCenter size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Alinear derecha">
          <AlignRight size={15} />
        </Btn>

        <Sep />

        {/* Extras */}
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Línea divisoria" active={false}>
          <Minus size={15} />
        </Btn>
        <Btn onClick={addLink} active={editor.isActive('link')} title="Enlace">
          <LinkIcon size={15} />
        </Btn>

        <div className="flex-1" />
        <Sep />

        {/* History */}
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Deshacer (Ctrl+Z)" active={false}>
          <Undo size={15} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Rehacer (Ctrl+Y)" active={false}>
          <Redo size={15} />
        </Btn>
      </div>

      {/* Editor area — styles mirror the public page render */}
      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className={cn(
          'px-4 py-4 focus-within:outline-none text-stone-800',
          // ProseMirror base
          '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[inherit]',
          // Placeholder
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-stone-400',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none',
          // Headings
          '[&_.ProseMirror_h2]:font-serif [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:text-primary [&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:mb-2',
          '[&_.ProseMirror_h3]:font-serif [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:text-primary [&_.ProseMirror_h3]:mt-5 [&_.ProseMirror_h3]:mb-2',
          // Paragraphs
          '[&_.ProseMirror_p]:mb-3 [&_.ProseMirror_p]:leading-relaxed',
          // Lists
          '[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:mb-3',
          '[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:mb-3',
          '[&_.ProseMirror_li]:mb-1',
          // Blockquote
          '[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-gold [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-stone-500 [&_.ProseMirror_blockquote]:my-4',
          // HR
          '[&_.ProseMirror_hr]:border-stone-300 [&_.ProseMirror_hr]:my-6',
          // Code
          '[&_.ProseMirror_code]:bg-stone-100 [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-sm [&_.ProseMirror_code]:font-mono',
          // Links
          '[&_.ProseMirror_a]:text-gold [&_.ProseMirror_a]:underline',
        )}
      />
    </div>
  );
}
