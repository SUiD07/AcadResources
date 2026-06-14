import { useState, useEffect, useCallback, useRef } from 'react';
// import { Editor, Range } from '@tiptap/core';
import { Editor, Range } from '@tiptap/react';
import {
  Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare,
  Quote, Code, Minus, Type,
} from 'lucide-react';

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (editor: Editor, range: Range) => void;
}

const COMMANDS: CommandItem[] = [
  {
    title: 'Text',
    description: 'ข้อความปกติ',
    icon: <Type className="w-4 h-4" />,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: 'Heading 1',
    description: 'หัวข้อใหญ่',
    icon: <Heading1 className="w-4 h-4" />,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    description: 'หัวข้อกลาง',
    icon: <Heading2 className="w-4 h-4" />,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    description: 'หัวข้อเล็ก',
    icon: <Heading3 className="w-4 h-4" />,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
  },
  {
    title: 'Bullet List',
    description: 'รายการแบบจุด',
    icon: <List className="w-4 h-4" />,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    description: 'รายการแบบตัวเลข',
    icon: <ListOrdered className="w-4 h-4" />,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: 'Task List',
    description: 'รายการ checkbox',
    icon: <CheckSquare className="w-4 h-4" />,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: 'Blockquote',
    description: 'อ้างอิง',
    icon: <Quote className="w-4 h-4" />,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: 'Code Block',
    description: 'บล็อกโค้ด',
    icon: <Code className="w-4 h-4" />,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: 'Divider',
    description: 'เส้นคั่น',
    icon: <Minus className="w-4 h-4" />,
    command: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

interface SlashMenuProps {
  editor: Editor;
  range: Range;
  query: string;
  onClose: () => void;
}

export function SlashMenu({ editor, range, query, onClose }: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = COMMANDS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const selectItem = useCallback(
    (index: number) => {
      const item = filtered[index];
      if (item) {
        item.command(editor, range);
        onClose();
      }
    },
    [filtered, editor, range, onClose]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectItem(selectedIndex);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [filtered, selectedIndex, selectItem, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute z-50 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-64 max-h-72 overflow-y-auto"
    >
      <p className="px-3 py-1 text-xs text-slate-400 font-medium uppercase tracking-wider">
        Blocks
      </p>
      {filtered.map((item, index) => (
        <button
          key={item.title}
          onClick={() => selectItem(index)}
          onMouseEnter={() => setSelectedIndex(index)}
          className={`
            w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
            ${index === selectedIndex ? 'bg-slate-100' : 'hover:bg-slate-50'}
          `}
        >
          <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded text-slate-600">
            {item.icon}
          </span>
          <div>
            <p className="text-sm font-medium text-slate-800">{item.title}</p>
            <p className="text-xs text-slate-400">{item.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}