import { useState } from "react";
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
};

// Categories whose files should be grouped into folders (by last folder_path segment)
// instead of shown as a flat file grid.
const FOLDER_GROUPED_CATEGORIES = new Set(["AC", "Lab & Spottest"]);

const UNFILED_FOLDER_LABEL = "ไฟล์อื่นๆ"; // "Other files" — bucket for items with no folder_path

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
}

interface ContentCategoryProps {
  categoryName: string;
  items: ContentItem[];
  isAdmin?: boolean;
  defaultExpanded?: boolean;
  onEdit?: (item: ContentItem) => void;
  onDelete?: (item: ContentItem) => void;
}

/**
 * ─── ROBUST THUMBNAIL GENERATOR ───
 * Extracts File ID from Drive link and generates a high-res thumbnail.
 */
function getDriveThumbnail(driveLink: string): string {
  const match = driveLink.match(/[-\w]{25,}/);
  const fileId = match?.[0];
  if (!fileId) return "";
  // sz=w600 provides a good balance between speed and quality for grid cards
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
}

/**
 * Extracts the last segment of a folder_path string, e.g.
 * "ACD Resources > AC SUPER > Comprehensive & NLE > NLE Step 2 > NLE 2020" → "NLE 2020"
 * Supports ">" or "/" as separators. Returns null if no usable path is present.
 */
function getLastFolderSegment(folderPath?: string): string | null {
  if (!folderPath || folderPath.trim() === "") return null;
  const separator = folderPath.includes(">") ? ">" : "/";
  const segments = folderPath
    .split(separator)
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length === 0) return null;
  return segments[segments.length - 1];
}

/** A single file card — used both in the flat grid and inside an expanded folder. */
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
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Image Section */}
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

      {/* Content Section */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500 w-fit"
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

        {/* Actions */}
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

/** A folder tile that expands to reveal the files inside it. */
function FolderGroup({
  folderName,
  items,
  categoryName,
  accentColor,
  isAdmin,
  onEdit,
  onDelete,
}: {
  folderName: string;
  items: ContentItem[];
  categoryName: string;
  accentColor: string;
  isAdmin: boolean;
  onEdit?: (item: ContentItem) => void;
  onDelete?: (item: ContentItem) => void;
}) {
  const [open, setOpen] = useState(false);

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
            {open ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{folderName}</p>
            <p className="text-xs text-slate-500">
              {items.length} file{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <span className="text-slate-400 ml-2 shrink-0">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </div>

      {open && (
        <div
          className="border-t border-slate-100 bg-slate-50/50"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "12px",
            padding: "16px",
          }}
        >
          {items.map((item) => (
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
  );
}

export function ContentCategory({
  categoryName,
  items,
  isAdmin = false,
  defaultExpanded = false,
  onEdit,
  onDelete,
}: ContentCategoryProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const uniqueItems = items.filter(
    (item, idx, arr) => arr.findIndex((i) => i.id === item.id) === idx,
  );

  if (items.length === 0) return null;

  const accentColor = TYPE_COLORS[categoryName] ?? "#6B7280";
  const isPrecourse = categoryName === "Precourse";
  const isFolderGrouped = FOLDER_GROUPED_CATEGORIES.has(categoryName);

  // Group items by last folder_path segment when this category is folder-grouped.
  const folderGroups = isFolderGrouped
    ? (() => {
        const map = new Map<string, ContentItem[]>();
        uniqueItems.forEach((item) => {
          const folderName = getLastFolderSegment(item.folder_path) ?? UNFILED_FOLDER_LABEL;
          if (!map.has(folderName)) map.set(folderName, []);
          map.get(folderName)!.push(item);
        });
        // Keep "Other files" last; everything else alphabetical.
        return [...map.entries()].sort(([a], [b]) => {
          if (a === UNFILED_FOLDER_LABEL) return 1;
          if (b === UNFILED_FOLDER_LABEL) return -1;
          return a.localeCompare(b);
        });
      })()
    : null;

  return (
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
          borderColor: isPrecourse ? "#BAE6FD" : expanded ? "#E2E8F0" : "transparent",
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
              {isFolderGrouped
                ? `${folderGroups!.length} folder${folderGroups!.length !== 1 ? "s" : ""} · ${items.length} resource${items.length !== 1 ? "s" : ""}`
                : `${items.length} resource${items.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!expanded && (
            <div className="hidden sm:flex gap-1 flex-wrap">
              {[...new Set(items.map((i) => i.generation))]
                .slice(0, 3)
                .map((gen) => (
                  <span
                    key={gen}
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "#FCE7F3", color: "#E5007D" }}
                  >
                    {gen}
                  </span>
                ))}
            </div>
          )}
          <span style={{ color: "#94A3B8" }}>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </span>
        </div>
      </div>

      {/* ── Accordion Body ── */}
      {expanded && (
        <div
          style={{
            padding: "16px",
            background: "white",
          }}
        >
          {isFolderGrouped ? (
            <div className="flex flex-col gap-2">
              {folderGroups!.map(([folderName, folderItems]) => (
                <FolderGroup
                  key={folderName}
                  folderName={folderName}
                  items={folderItems}
                  categoryName={categoryName}
                  accentColor={accentColor}
                  isAdmin={isAdmin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "12px",
              }}
            >
              {uniqueItems.map((item) => (
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