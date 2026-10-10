import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useFolderSettings } from "../FolderSettingsContext";
import type { FolderSettingRow } from "../FolderSettingsContext";

/** Minimal tree shape (ContentCategory's FolderNode satisfies it). */
export interface FolderTreeNode {
  name: string;
  fullPath: string;
  children: Map<string, FolderTreeNode>;
  items: unknown[];
}

interface DraftNode {
  path: string;
  original: string; // name from Google Drive
  name: string; // custom name ("" = use Drive name)
  hidden: boolean;
  fileCount: number;
}

const ROOT = "";

interface Shared {
  nodes: Record<string, DraftNode>;
  groups: Record<string, string[]>;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onRename: (id: string, value: string) => void;
  onToggleHidden: (id: string) => void;
}

function countFiles(node: FolderTreeNode): number {
  let total = node.items.length;
  for (const child of node.children.values()) total += countFiles(child);
  return total;
}

function FolderList({ parent, shared }: { parent: string; shared: Shared }) {
  const ids = shared.groups[parent] ?? [];
  if (ids.length === 0) return null;
  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      <div className="flex flex-col gap-2">
        {ids.map((id) => (
          <FolderRow key={id} id={id} shared={shared} />
        ))}
      </div>
    </SortableContext>
  );
}

function FolderRow({ id, shared }: { id: string; shared: Shared }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const node = shared.nodes[id];
  if (!node) return null;

  const kids = shared.groups[id] ?? [];
  const open = shared.expanded.has(id);
  const renamed = node.name.trim() !== "" && node.name.trim() !== node.original;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="rounded-lg border border-slate-200 bg-white"
    >
      <div className="flex items-center gap-1 p-2">
        <button
          type="button"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
          className="p-1.5 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {kids.length > 0 ? (
          <button
            type="button"
            aria-label={open ? "Collapse" : "Expand"}
            onClick={() => shared.onToggle(id)}
            className="p-1 text-slate-500 hover:text-slate-700"
          >
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-6" />
        )}

        <div className="min-w-0 flex-1">
          <Input
            value={node.name}
            placeholder={node.original}
            onChange={(e) => shared.onRename(id, e.target.value)}
            className={node.hidden ? "text-slate-400 italic" : ""}
          />
          <p className="text-xs text-slate-500 mt-1 truncate">
            {node.fileCount} file{node.fileCount !== 1 ? "s" : ""}
            {renamed ? ` · Drive name: ${node.original}` : ""}
            {node.hidden ? " · hidden from students" : ""}
          </p>
        </div>

        <button
          type="button"
          aria-label={node.hidden ? "Show folder" : "Hide folder"}
          onClick={() => shared.onToggleHidden(id)}
          className="p-2 rounded hover:bg-slate-100 text-slate-500"
        >
          {node.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {open && kids.length > 0 && (
        <div className="border-l-2 border-slate-200 ml-8 pl-3 pb-2 pr-2">
          <FolderList parent={id} shared={shared} />
        </div>
      )}
    </div>
  );
}

interface ManageFoldersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  root: FolderTreeNode;
}

export function ManageFoldersDialog({
  open,
  onOpenChange,
  categoryName,
  root,
}: ManageFoldersDialogProps) {
  const fs = useFolderSettings();
  const [nodes, setNodes] = useState<Record<string, DraftNode>>({});
  const [groups, setGroups] = useState<Record<string, string[]>>({});
  const [initialGroups, setInitialGroups] = useState<Record<string, string[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  // Build the draft from the current tree + saved settings each time it opens.
  useEffect(() => {
    if (!open) return;
    const n: Record<string, DraftNode> = {};
    const g: Record<string, string[]> = {};

    const walk = (node: FolderTreeNode, parentKey: string) => {
      const kids = fs.sortFolders<FolderTreeNode>(Array.from(node.children.values()));
      g[parentKey] = kids.map((k) => k.fullPath);
      for (const k of kids) {
        const s = fs.getSetting(k.fullPath);
        n[k.fullPath] = {
          path: k.fullPath,
          original: k.name,
          name: s?.custom_name ?? "",
          hidden: s?.hidden ?? false,
          fileCount: countFiles(k),
        };
        walk(k, k.fullPath);
      }
    };
    walk(root, ROOT);

    setNodes(n);
    setGroups(g);
    setInitialGroups(g);
    setExpanded(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const parentOf = useMemo(() => {
    const m: Record<string, string> = {};
    for (const [parent, kids] of Object.entries(groups)) {
      for (const k of kids) m[k] = parent;
    }
    return m;
  }, [groups]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const a = String(active.id);
    const o = String(over.id);
    const parent = parentOf[a];
    // Folders can only be reordered among their own siblings.
    if (parent === undefined || parentOf[o] !== parent) return;
    setGroups((cur) => {
      const list = cur[parent];
      return { ...cur, [parent]: arrayMove(list, list.indexOf(a), list.indexOf(o)) };
    });
  };

  const shared: Shared = {
    nodes,
    groups,
    expanded,
    onToggle: (id) =>
      setExpanded((cur) => {
        const next = new Set(cur);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    onRename: (id, value) =>
      setNodes((cur) => ({ ...cur, [id]: { ...cur[id], name: value } })),
    onToggleHidden: (id) =>
      setNodes((cur) => ({ ...cur, [id]: { ...cur[id], hidden: !cur[id].hidden } })),
  };

  const handleSave = async () => {
    setSaving(true);
    const rows = new Map<string, FolderSettingRow>();
    const row = (path: string): FolderSettingRow => {
      let r = rows.get(path);
      if (!r) {
        r = { folder_path: path };
        rows.set(path, r);
      }
      return r;
    };

    // Only write what actually changed.
    for (const n of Object.values(nodes)) {
      const saved = fs.getSetting(n.path);
      const trimmed = n.name.trim();
      const customName = trimmed && trimmed !== n.original ? trimmed : null;
      if (customName !== (saved?.custom_name ?? null)) row(n.path).custom_name = customName;
      if (n.hidden !== (saved?.hidden ?? false)) row(n.path).hidden = n.hidden;
    }
    for (const [parent, ids] of Object.entries(groups)) {
      const before = initialGroups[parent] ?? [];
      if (ids.join("\u0000") === before.join("\u0000")) continue;
      ids.forEach((path, i) => {
        row(path).sort_order = i;
      });
    }

    const ok = await fs.saveMany([...rows.values()]);
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  const isEmpty = (groups[ROOT] ?? []).length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Folders</DialogTitle>
          <DialogDescription>
            Rename, reorder and hide folders in {categoryName}. Drag the handle to reorder. Leave a
            name empty to use the Google Drive name. Your Drive files are not changed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isEmpty ? (
            <p className="text-sm text-slate-500">This category has no folders.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <FolderList parent={ROOT} shared={shared} />
            </DndContext>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || isEmpty}
            className="bg-[#E5007D] hover:bg-[#c00069]"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}