import { useDebouncedCallback } from "use-debounce";
import { SimpleEditor } from "../../../@/components/tiptap-templates/simple/simple-editor";
interface Props {
  boardId: string;
  initialContent: object;
  onSave: (content: object) => void;
  isAdmin?: boolean;
}

export function Editor({
  boardId,
  initialContent,
  onSave,
  isAdmin = false,
}: Props) {
  const debouncedSave = useDebouncedCallback((content: object) => {
    onSave(content);
  }, 1200);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <SimpleEditor
        initialContent={initialContent}
        onContentChange={(json) => {
          if (isAdmin) debouncedSave(json);
        }}
        editable={isAdmin}
      />
    </div>
  );
}
