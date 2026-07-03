import { useState, createContext, useContext } from "react";
import {
  ExternalLink,
  Folder,
  FolderOpen,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// ─── TYPE COLORS ─────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  Precourse: "#0EA5E9",
  AC: "#3B82F6",
  Summary: "#10B981",
  "Peer Tutoring": "#8B5CF6",
  "Mock Exam": "#F43F5E",
  "Lab & Spottest": "#F59E0B",
  "NLE 1": "#EC4899",
  "NLE 2": "#D946EF",
  Resources: "#06B6D4",
  "Survival Guide": "#84CC16",
  "Lecture Slide": "#06B6D4",
  "Textbook": "#EC4899",
  "Checklist": "#D946EF",
  "Guideline": "#F59E0B"
};

// ─── VIEW MODE CONTEXT ────────────────────────────────────────────────────────
const ViewModeContext = createContext<"grid" | "list">("grid");

interface ContentItem {
  id: string;
  block_name: string;
  block_code?: string;
  thumbnail: string;
  drive_link: string;
  generation: string;
  block: string;
  category: string;
  folder_path?: string;
  board_exam?: string;
}

interface ContentCategoryProps {
  categoryName: string;
  items: ContentItem[];
  isAdmin?: boolean;
  defaultExpanded?: boolean;
  viewMode?: "grid" | "list";
  onEdit?: (item: ContentItem) => void;
  onDelete?: (item: ContentItem) => void;
}

// ─── THUMBNAIL ────────────────────────────────────────────────────────────────
function getDriveThumbnail(driveLink: string): string {
  const match = driveLink.match(/[-\w]{25,}/);
  const fileId = match?.[0];
  if (!fileId) return "";
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
}

// ─── FOLDER TREE HELPERS ──────────────────────────────────────────────────────

interface FolderNode {
  name: string;
  fullPath: string;
  children: Map<string, FolderNode>;
  items: ContentItem[];
}

function makeFolderNode(name: string, fullPath: string): FolderNode {
  return { name, fullPath, children: new Map(), items: [] };
}

/**
 * Build a full-path tree from items' folder_path strings.
 * Each path segment becomes a tree level, so siblings from different
 * branches are never merged even if their last segment matches.
 */
function buildFolderTree(items: ContentItem[]): FolderNode {
  const root = makeFolderNode("", "");

  for (const item of items) {
    const raw = item.folder_path || "";
    const separator = raw.includes(" > ") ? " > " : "/";
    const segments = raw
      .split(separator)
      .map((s) => s.trim())
      .filter(Boolean);

    let node = root;
    let builtPath = "";
    for (const seg of segments) {
      builtPath = builtPath ? `${builtPath}/${seg}` : seg;
      if (!node.children.has(seg)) {
        node.children.set(seg, makeFolderNode(seg, builtPath));
      }
      node = node.children.get(seg)!;
    }
    node.items.push(item);
  }

  return root;
}

function countDescendants(node: FolderNode): number {
  let total = node.items.length;
  for (const child of node.children.values()) {
    total += countDescendants(child);
  }
  return total;
}

/**
 * Collapse chains where a folder has no direct files and exactly one child —
 * merge the names with " / " so the UI doesn't show pointless single-child nesting.
 */
function collapseChains(node: FolderNode): FolderNode {
  // Recurse children first
  const collapsedChildren = new Map<string, FolderNode>();
  for (const [key, child] of node.children) {
    collapsedChildren.set(key, collapseChains(child));
  }
  node.children = collapsedChildren;

  // Collapse this node if it has no direct items and exactly one child
  if (node.items.length === 0 && node.children.size === 1 && node.name !== "") {
    const [, onlyChild] = [...node.children.entries()][0];
    return {
      name: onlyChild.name,
      fullPath: onlyChild.fullPath,
      children: onlyChild.children,
      items: onlyChild.items,
    };
  }

  return node;
}

// ─── FILE CARD ────────────────────────────────────────────────────────────────
function FileCard({
  item,
  categoryName,
  accentColor,
  isAdmin,
  onEdit,
  onDelete,
}: {
  item: ContentItem;
  categoryName: string;
  accentColor: string;
  isAdmin: boolean;
  onEdit?: (item: ContentItem) => void;
  onDelete?: (item: ContentItem) => void;
}) {
  const viewMode = useContext(ViewModeContext);

  // ── List view ──
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg border border-slate-200 flex items-center gap-3 px-4 py-3 hover:shadow-sm transition-shadow">
        <div
          className="shrink-0 rounded-md overflow-hidden bg-slate-100 border border-slate-100"
          style={{ width: 72, height: 40 }}
        >
          <ImageWithFallback
            src={item.thumbnail || getDriveThumbnail(item.drive_link)}
            alt={item.block_name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {item.block_code && (
              <span className="text-xs text-slate-400">{item.block_code}</span>
            )}
            <span
              className="text-[5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-lg"
              style={{ color: accentColor, background: `${accentColor}18`, paddingLeft: "10px", paddingRight: "10px" }}
            >
              {categoryName}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900 truncate mt-0.5">
            {item.block_name}
          </p>
          <div className="flex gap-1.5 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {item.block}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "#FDF2F8", color: "#BE185D" }}
            >
              {item.generation}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <a
              href={item.drive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Open
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(item)}
                className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50"
              >
                <Pencil className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete?.(item)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Grid view (default) ──
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div
        className="w-full bg-slate-50 border-b border-slate-100 overflow-hidden relative"
        style={{ aspectRatio: "16/9" }}
      >
        <ImageWithFallback
          src={item.thumbnail || getDriveThumbnail(item.drive_link)}
          alt={item.block_name}
          className="w-full h-full object-cover"
          loading="lazy"
          style={{ display: "block" }}
        />
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded rounded-lg bg-slate-100 text-slate-500 w-fit"
          style={{ color: accentColor, background: `${accentColor}18` }}
        >
          {categoryName}
        </span>

        <div className="flex-1">
          {item.block_code && (
            <p className="text-xs text-slate-400 mb-0.5">{item.block_code}</p>
          )}
          <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
            {item.block_name}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {item.block}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: "#FDF2F8", color: "#BE185D" }}
          >
            {item.generation}
          </span>
        </div>

        <div className="flex gap-2 pt-2 border-t border-slate-50 mt-1">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a
              href={item.drive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Open Drive
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
          {isAdmin && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(item)}
                className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50"
              >
                <Pencil className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete?.(item)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── FOLDER GROUP (recursive) ─────────────────────────────────────────────────
function FolderGroup({
  node,
  categoryName,
  accentColor,
  isAdmin,
  onEdit,
  onDelete,
  depth = 0, // NEW
}: {
  node: FolderNode;
  categoryName: string;
  accentColor: string;
  isAdmin: boolean;
  onEdit?: (item: ContentItem) => void;
  onDelete?: (item: ContentItem) => void;
  depth?: number; // NEW
}) {
  const [open, setOpen] = useState(false);
  const viewMode = useContext(ViewModeContext);
  const total = countDescendants(node);

  const sortedChildren = [...node.children.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const realFolderChildren = sortedChildren.filter(
    (c) => countDescendants(c) > 1
  );
  const flatFromChildren = sortedChildren
    .filter((c) => countDescendants(c) === 1)
    .flatMap((c) => collectAllItems(c));

  const flatItems = [...node.items, ...flatFromChildren];

 const cardMinWidth = Math.max(260 - depth * 40, 160);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div
        role="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between cursor-pointer select-none px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="shrink-0 flex items-center justify-center rounded-lg"
            style={{
              width: 36,
              height: 36,
              background: `${accentColor}18`,
              color: accentColor,
            }}
          >
            {open ? (
              <FolderOpen className="w-4 h-4" />
            ) : (
              <Folder className="w-4 h-4" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {node.name}
            </p>
            <p className="text-xs text-slate-500">{total} files</p>
          </div>
        </div>
        <span className="text-slate-400 ml-2 shrink-0">
          {open ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>
      </div>

      {open && (
       <div
          className={
            depth === 0
              ? "border-t border-slate-100 bg-slate-50/50 p-4 flex flex-col gap-3"
              : "border-l-2 border-slate-200 ml-3 pl-3 py-3 flex flex-col gap-3"
          }
        >
          {realFolderChildren.length > 0 && (
            <div className="flex flex-col gap-2">
              {realFolderChildren.map((child) => (
                <FolderGroup
                  key={child.fullPath}
                  node={child}
                  categoryName={categoryName}
                  accentColor={accentColor}
                  isAdmin={isAdmin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  depth={depth + 1} // NEW
                />
              ))}
            </div>
          )}

          {flatItems.length > 0 && (
            <div
              style={
                viewMode === "grid"
                  ? {
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                      gap: "12px",
                    }
                  : {
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }
              }
            >
              {flatItems.map((item) => (
                <FileCard
                  key={item.id}
                  item={item}
                  categoryName={categoryName}
                  accentColor={accentColor}
                  isAdmin={isAdmin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Recursively collect all ContentItems from a node and its descendants. */
function collectAllItems(node: FolderNode): ContentItem[] {
  return [
    ...node.items,
    ...[...node.children.values()].flatMap(collectAllItems),
  ];
}

// ─── CONTENT CATEGORY ─────────────────────────────────────────────────────────
export function ContentCategory({
  categoryName,
  items,
  isAdmin = false,
  defaultExpanded = false,
  viewMode = "grid",
  onEdit,
  onDelete,
}: ContentCategoryProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const uniqueItems = items.filter(
    (item, idx, arr) => arr.findIndex((i) => i.id === item.id) === idx
  );

  if (items.length === 0) return null;

  const accentColor = TYPE_COLORS[categoryName] ?? "#6B7280";
  const isPrecourse = categoryName === "Precourse";

  // Build the full recursive tree, then collapse pointless single-child chains
  const rawTree = buildFolderTree(uniqueItems);
  const tree = collapseChains(rawTree);

  // Top-level: children with 2+ descendants become FolderGroups;
  // children with 1 descendant + root direct items render flat.
  const sortedTopChildren = [...tree.children.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const realFolders = sortedTopChildren.filter(
    (c) => countDescendants(c) > 1
  );
  const flatItems = [
    ...tree.items,
    ...sortedTopChildren
      .filter((c) => countDescendants(c) === 1)
      .flatMap(collectAllItems),
  ];

  const folderCount = realFolders.length;
  const flatCount = flatItems.length;

  return (
    <ViewModeContext.Provider value={viewMode}>
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: isPrecourse ? "#F0F9FF" : "white",
          borderColor: isPrecourse ? "#BAE6FD" : "#E2E8F0",
        }}
      >
        {/* ── Accordion Header ── */}
        <div
          role="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center justify-between cursor-pointer select-none px-4 sm:px-6 py-3 sm:py-4 border-b"
          style={{
            background: isPrecourse ? "#E0F2FE" : "#F8FAFC",
            borderColor: isPrecourse
              ? "#BAE6FD"
              : expanded
              ? "#E2E8F0"
              : "transparent",
          }}
        >
          <div className="flex items-center gap-3">
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: accentColor,
                flexShrink: 0,
                boxShadow: `0 0 0 3px ${accentColor}22`,
              }}
            />
            <div>
              <h3
                className="font-semibold text-sm sm:text-base"
                style={{ color: isPrecourse ? "#0369A1" : "#0F172A" }}
              >
                {isPrecourse && "📋 "}
                {categoryName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {folderCount > 0
                  ? `${folderCount} folder${folderCount !== 1 ? "s" : ""}${
                      flatCount > 0
                        ? ` · ${flatCount} file${flatCount !== 1 ? "s" : ""}`
                        : ""
                    }`
                  : `${items.length} resource${items.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span style={{ color: "#94A3B8" }}>
              {expanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </span>
          </div>
        </div>

        {/* ── Accordion Body ── */}
        {expanded && (
          <div
            style={{
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "white",
            }}
          >
            {/* Real folders (2+ files) — recursive */}
            {realFolders.length > 0 && (
              <div className="flex flex-col gap-2">
                {realFolders.map((node) => (
                  <FolderGroup
                    key={node.fullPath}
                    node={node}
                    categoryName={categoryName}
                    accentColor={accentColor}
                    isAdmin={isAdmin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}

            {/* Flat files */}
            {flatItems.length > 0 && (
              <div
                style={
                  viewMode === "grid"
                    ? {
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "12px",
                      }
                    : {
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }
                }
              >
                {flatItems.map((item) => (
                  <FileCard
                    key={item.id}
                    item={item}
                    categoryName={categoryName}
                    accentColor={accentColor}
                    isAdmin={isAdmin}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ViewModeContext.Provider>
  );
}