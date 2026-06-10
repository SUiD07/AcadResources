import { useRef, useState } from 'react';
import {
  Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Image as ImageIcon, Link
} from 'lucide-react';
import { Button } from '../ui/button';

interface CustomEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function CustomEditor({ content, onChange, placeholder = 'Start writing...', editable = true }: CustomEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertFormatting = (tag: string) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText) {
      document.execCommand('insertHTML', false, `<${tag}>${selectedText}</${tag}>`);
    } else {
      document.execCommand('insertHTML', false, `<${tag}>Text</${tag}>`);
    }

    handleInput();
  };

  const insertHeading = (level: 1 | 2) => {
    document.execCommand('formatBlock', false, `h${level}`);
    handleInput();
  };

  const insertList = (ordered: boolean) => {
    document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList', false);
    handleInput();
  };

  const insertBlockquote = () => {
    document.execCommand('formatBlock', false, 'blockquote');
    handleInput();
  };

  const insertImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      document.execCommand('insertHTML', false, `<img src="${url}" alt="Image" style="max-width: 100%; height: auto; margin: 1em 0;" />`);
      handleInput();
    }
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      const selection = window.getSelection();
      const selectedText = selection?.toString() || url;
      document.execCommand('insertHTML', false, `<a href="${url}" style="color: #E5007D; text-decoration: underline;">${selectedText}</a>`);
      handleInput();
    }
  };

  if (!editable) {
    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(1)}
          className="hover:bg-slate-200"
          tabIndex={-1}
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(2)}
          className="hover:bg-slate-200"
          tabIndex={-1}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => document.execCommand('bold')}
          className="hover:bg-slate-200"
          tabIndex={-1}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => document.execCommand('italic')}
          className="hover:bg-slate-200"
          tabIndex={-1}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertList(false)}
          className="hover:bg-slate-200"
          tabIndex={-1}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertList(true)}
          className="hover:bg-slate-200"
          tabIndex={-1}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertBlockquote}
          className="hover:bg-slate-200"
          tabIndex={-1}
        >
          <Quote className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertImage}
          className="hover:bg-slate-200"
          tabIndex={-1}
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          className="hover:bg-slate-200"
          tabIndex={-1}
        >
          <Link className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="p-4 min-h-[300px]">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="outline-none prose prose-sm max-w-none min-h-[280px]"
          dangerouslySetInnerHTML={{ __html: content }}
          data-placeholder={placeholder}
          style={{
            ...(content === '' && !isFocused ? {
              position: 'relative',
            } : {})
          }}
        />
        {content === '' && !isFocused && (
          <div
            className="absolute pointer-events-none text-slate-400 mt-[-280px] ml-4"
            style={{ userSelect: 'none' }}
          >
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
