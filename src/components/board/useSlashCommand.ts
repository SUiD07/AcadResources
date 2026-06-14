import { useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import type { Range } from '@tiptap/react';

interface SlashState {
  isOpen: boolean;
  range: Range | null;
  query: string;
  position: { top: number; left: number };
}

export function useSlashCommand(editor: Editor | null) {
  const [state, setState] = useState<SlashState>({
    isOpen: false,
    range: null,
    query: '',
    position: { top: 0, left: 0 },
  });

  const open = useCallback(
    (range: Range, query: string) => {
      if (!editor) return;
      const { view } = editor;
      const { from } = range;
      const coords = view.coordsAtPos(from);
      const editorRect = view.dom.getBoundingClientRect();

      setState({
        isOpen: true,
        range,
        query,
        position: {
          top: coords.bottom - editorRect.top + 8,
          left: coords.left - editorRect.left,
        },
      });
    },
    [editor]
  );

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, range: null, query: '' }));
  }, []);

  return { state, open, close };
}