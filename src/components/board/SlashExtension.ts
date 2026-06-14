import { Extension } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import type { Range } from '@tiptap/react';

interface SlashExtensionOptions {
  onOpen: (range: Range, query: string) => void;
  onClose: () => void;
  onQueryChange: (query: string) => void;
}

export function createSlashExtension(options: SlashExtensionOptions) {
  return Extension.create<SlashExtensionOptions>({
    name: 'slashCommand',
    addOptions() {
      return options;
    },
    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          char: '/',
          startOfLine: false,
          command: ({ editor, range, props }) => {
            props?.command?.(editor, range);
          },
          items: ({ query }) => {
            options.onQueryChange(query);
            return [];
          },
          render: () => ({
            onStart: (props) => options.onOpen(props.range, props.query),
            onUpdate: (props) => options.onOpen(props.range, props.query),
            onExit: () => options.onClose(),
          }),
        }),
      ];
    },
  });
}