import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { SlashMenu } from './SlashCommand';
import { createSlashExtension } from './SlashExtension';
import type { Range } from '@tiptap/react';

interface Props {
  boardId: string;
  initialContent: object;
  onSave: (content: object) => void;
  isAdmin?: boolean;
}

export function Editor({ boardId, initialContent, onSave, isAdmin = false }: Props) {
  const debouncedSave = useDebouncedCallback((content: object) => {
    onSave(content);
  }, 1200);

  const [slashOpen, setSlashOpen] = useState(false);
  const [slashRange, setSlashRange] = useState<Range | null>(null);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashPos, setSlashPos] = useState({ top: 0, left: 0 });
  const editorWrapRef = useRef<HTMLDivElement>(null);

  const slashExtension = createSlashExtension({
    onOpen: (range, query) => {
      setSlashRange(range);
      setSlashQuery(query);
      setSlashOpen(true);
    },
    onClose: () => setSlashOpen(false),
    onQueryChange: (query) => setSlashQuery(query),
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: ({ node }) =>
          node.type.name === 'heading'
            ? 'หัวข้อ...'
            : "พิมพ์ '/' เพื่อเลือก block...",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      slashExtension,
    ],
    content: initialContent,
    editable: isAdmin,
    onUpdate: ({ editor }) => {
      if (isAdmin) debouncedSave(editor.getJSON());
    },
  });

  // update slash menu position จาก cursor
  useEffect(() => {
    if (!editor || !slashOpen || !slashRange) return;
    const coords = editor.view.coordsAtPos(slashRange.from);
    const wrapRect = editorWrapRef.current?.getBoundingClientRect();
    if (wrapRect) {
      setSlashPos({
        top: coords.bottom - wrapRect.top + 4,
        left: coords.left - wrapRect.left,
      });
    }
  }, [slashOpen, slashQuery]);

  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [boardId]);

  useEffect(() => {
    editor?.setEditable(isAdmin);
  }, [isAdmin, editor]);

  if (!editor) return null;

  return (
    <div ref={editorWrapRef} className="relative">
      <div className="notion-editor max-w-3xl mx-auto px-8 py-6">
        <EditorContent editor={editor} />
      </div>

      {/* Slash Command Menu */}
      {slashOpen && slashRange && (
        <div style={{ position: 'absolute', top: slashPos.top, left: slashPos.left }}>
          <SlashMenu
            editor={editor}
            range={slashRange}
            query={slashQuery}
            onClose={() => setSlashOpen(false)}
          />
        </div>
      )}
    </div>
  );
}