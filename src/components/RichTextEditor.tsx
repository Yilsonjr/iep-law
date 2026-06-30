import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  List, ListOrdered, ListChecks, Heading2, Heading3,
  Link as LinkIcon, Undo, Redo, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Minus, ImageIcon, Video as YoutubeIcon,
  Superscript as SuperscriptIcon, Subscript as SubscriptIcon,
  Highlighter, Type, Upload, X,
} from 'lucide-react';
import { cn } from '../utils';
import { supabase } from '../config/supabase';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

// ── Upload image to Supabase Storage ─────────────────────────────
async function uploadImageToStorage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from('media')
    .upload(`pages/${name}`, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from('media').getPublicUrl(`pages/${name}`);
  return data.publicUrl;
}

// ── Toolbar button ────────────────────────────────────────────────
function Btn({
  onClick, active, title, disabled, children,
}: {
  onClick: () => void; active?: boolean; title: string;
  disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={e => { e.preventDefault(); if (!disabled) onClick(); }}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors',
        active ? 'bg-primary text-white shadow-sm' : 'text-stone-600 hover:bg-stone-200 hover:text-stone-900',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-stone-300 mx-0.5 self-center shrink-0" />;
}

// ── Image panel (URL or Upload) ───────────────────────────────────
function ImagePanel({ onInsert, onClose }: { onInsert: (url: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Máximo 5 MB'); return; }
    setUploading(true);
    setError('');
    try {
      const publicUrl = await uploadImageToStorage(file);
      onInsert(publicUrl);
    } catch {
      setError('Error al subir. Verifica el bucket "media" en Supabase Storage.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-stone-200 rounded-xl shadow-xl p-4 w-80">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-stone-700">Insertar imagen</p>
        <button type="button" onMouseDown={e => { e.preventDefault(); onClose(); }}
          className="text-stone-400 hover:text-stone-600"><X size={15} /></button>
      </div>

      {/* URL */}
      <div className="space-y-1 mb-3">
        <label className="text-xs text-stone-500">URL de imagen</label>
        <div className="flex gap-2">
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
            className="flex-1 text-sm border border-stone-200 rounded-lg px-3 py-1.5 outline-none focus:border-primary"
            onKeyDown={e => { if (e.key === 'Enter' && url) { e.preventDefault(); onInsert(url); } }}
          />
          <button type="button" onMouseDown={e => { e.preventDefault(); if (url) onInsert(url); }}
            className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors">
            OK
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-stone-400 mb-3">
        <div className="h-px flex-1 bg-stone-200" /> o <div className="h-px flex-1 bg-stone-200" />
      </div>

      {/* Upload */}
      <button type="button"
        onMouseDown={e => { e.preventDefault(); fileRef.current?.click(); }}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-stone-300 hover:border-primary rounded-xl text-sm text-stone-500 hover:text-primary transition-colors disabled:opacity-50">
        {uploading ? (
          <><span className="animate-spin">⏳</span> Subiendo...</>
        ) : (
          <><Upload size={15} /> Subir desde mi dispositivo</>
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────
export function RichTextEditor({
  value, onChange, placeholder = 'Escribe aquí...', className, minHeight = '240px',
}: RichTextEditorProps) {
  const [showImagePanel, setShowImagePanel] = useState(false);
  const imageBtnRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);
  const highlightRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ width: 640, height: 360, nocookie: true }),
      Superscript,
      Subscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync when external value changes (e.g. opening existing page)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  // Close image panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (imageBtnRef.current && !imageBtnRef.current.contains(e.target as Node)) {
        setShowImagePanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!editor) return null;

  const insertImage = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
    setShowImagePanel(false);
  };

  const insertYoutube = () => {
    const url = prompt('URL del video de YouTube:');
    if (url) editor.commands.setYoutubeVideo({ src: url });
  };

  const addLink = () => {
    const prev = (editor.getAttributes('link').href as string) ?? '';
    const url = prompt('URL del enlace:', prev);
    if (url === null) return;
    if (url === '') editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
  };

  const chars = editor.storage.characterCount?.characters() ?? 0;
  const words = editor.storage.characterCount?.words() ?? 0;

  return (
    <div className={cn('border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm', className)}>
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-stone-200 bg-stone-50 sticky top-0 z-10">

        {/* History */}
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Deshacer (Ctrl+Z)" disabled={!editor.can().undo()}>
          <Undo size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Rehacer (Ctrl+Y)" disabled={!editor.can().redo()}>
          <Redo size={14} />
        </Btn>

        <Sep />

        {/* Text style */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrita (Ctrl+B)">
          <Bold size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Cursiva (Ctrl+I)">
          <Italic size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Subrayado (Ctrl+U)">
          <UnderlineIcon size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Tachado">
          <Strikethrough size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superíndice">
          <SuperscriptIcon size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subíndice">
          <SubscriptIcon size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Código inline">
          <Code size={14} />
        </Btn>

        <Sep />

        {/* Color */}
        <div className="relative flex items-center" title="Color de texto">
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); colorRef.current?.click(); }}
            className="p-1.5 rounded hover:bg-stone-200 transition-colors flex flex-col items-center gap-0.5"
            title="Color de texto"
          >
            <Type size={14} className="text-stone-600" />
            <div className="w-3.5 h-1 rounded-sm" style={{ backgroundColor: editor.getAttributes('textStyle').color ?? '#000000' }} />
          </button>
          <input
            ref={colorRef}
            type="color"
            defaultValue="#8D000A"
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          />
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetColor().run(); }}
            className="text-xs text-stone-400 hover:text-red-500 px-0.5"
            title="Quitar color"
          >×</button>
        </div>

        {/* Highlight */}
        <div className="relative flex items-center" title="Resaltado">
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); highlightRef.current?.click(); }}
            className="p-1.5 rounded hover:bg-stone-200 transition-colors flex flex-col items-center gap-0.5"
            title="Resaltar texto"
          >
            <Highlighter size={14} className="text-stone-600" />
            <div className="w-3.5 h-1 rounded-sm" style={{ backgroundColor: editor.isActive('highlight') ? (editor.getAttributes('highlight').color ?? '#fde68a') : '#fde68a' }} />
          </button>
          <input
            ref={highlightRef}
            type="color"
            defaultValue="#fde68a"
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            onChange={e => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
          />
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); }}
            className="text-xs text-stone-400 hover:text-red-500 px-0.5"
            title="Quitar resaltado"
          >×</button>
        </div>

        <Sep />

        {/* Headings */}
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título H2">
          <Heading2 size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Título H3">
          <Heading3 size={14} />
        </Btn>

        <Sep />

        {/* Lists */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista con viñetas">
          <List size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">
          <ListOrdered size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Lista de tareas / checklist">
          <ListChecks size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Cita en bloque">
          <Quote size={14} />
        </Btn>

        <Sep />

        {/* Alignment */}
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Alinear izquierda">
          <AlignLeft size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centrar">
          <AlignCenter size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Alinear derecha">
          <AlignRight size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justificar">
          <AlignJustify size={14} />
        </Btn>

        <Sep />

        {/* Extras */}
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Línea divisoria" active={false}>
          <Minus size={14} />
        </Btn>
        <Btn onClick={addLink} active={editor.isActive('link')} title="Insertar enlace">
          <LinkIcon size={14} />
        </Btn>

        <Sep />

        {/* Media */}
        <div ref={imageBtnRef} className="relative">
          <Btn onClick={() => setShowImagePanel(v => !v)} active={showImagePanel} title="Insertar imagen">
            <ImageIcon size={14} />
          </Btn>
          {showImagePanel && (
            <ImagePanel onInsert={insertImage} onClose={() => setShowImagePanel(false)} />
          )}
        </div>
        <Btn onClick={insertYoutube} title="Insertar video de YouTube" active={false}>
          <YoutubeIcon size={14} />
        </Btn>

        {/* Character count */}
        <div className="ml-auto text-xs text-stone-400 px-2 self-center whitespace-nowrap">
          {words} palabras · {chars} caracteres
        </div>
      </div>

      {/* ── Editor area ──────────────────────────────────────── */}
      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className={cn(
          'px-5 py-4 focus-within:outline-none text-stone-800',
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
          // Task list
          '[&_.ProseMirror_ul[data-type=taskList]]:list-none [&_.ProseMirror_ul[data-type=taskList]]:pl-0',
          '[&_.ProseMirror_li[data-type=taskItem]]:flex [&_.ProseMirror_li[data-type=taskItem]]:gap-2 [&_.ProseMirror_li[data-type=taskItem]]:items-start',
          '[&_.ProseMirror_li[data-type=taskItem]_label]:flex [&_.ProseMirror_li[data-type=taskItem]_label]:items-center',
          '[&_.ProseMirror_li[data-type=taskItem]_input]:mt-1 [&_.ProseMirror_li[data-type=taskItem]_input]:accent-primary',
          // Blockquote
          '[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-gold [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-stone-500 [&_.ProseMirror_blockquote]:my-4',
          // HR
          '[&_.ProseMirror_hr]:border-stone-300 [&_.ProseMirror_hr]:my-6',
          // Code
          '[&_.ProseMirror_code]:bg-stone-100 [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-sm [&_.ProseMirror_code]:font-mono',
          '[&_.ProseMirror_pre]:bg-stone-900 [&_.ProseMirror_pre]:text-stone-100 [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:rounded-xl [&_.ProseMirror_pre]:my-4 [&_.ProseMirror_pre]:overflow-auto',
          // Links
          '[&_.ProseMirror_a]:text-gold [&_.ProseMirror_a]:underline',
          // Images
          '[&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-xl [&_.ProseMirror_img]:my-4 [&_.ProseMirror_img]:shadow-md',
          '[&_.ProseMirror_img.ProseMirror-selectednode]:ring-2 [&_.ProseMirror_img.ProseMirror-selectednode]:ring-primary',
          // YouTube iframe
          '[&_.ProseMirror_.youtube-wrapper]:my-4 [&_.ProseMirror_iframe]:rounded-xl [&_.ProseMirror_iframe]:max-w-full',
        )}
      />
    </div>
  );
}
