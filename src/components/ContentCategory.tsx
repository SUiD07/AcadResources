import { useState } from "react";
import {
  ExternalLink,
  FolderOpen,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
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

interface ContentItem {
  id: string;
  block_name: string;
  block_code?: string;
  thumbnail: string;
  drive_link: string;
  generation: string;
  block: string;
  category: string;
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
              {items.length} resource{items.length !== 1 ? "s" : ""}
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

      {/* ── Accordion Body (Grid View) ── */}
      {expanded && (
        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "12px",
            padding: "16px",
            background: "white",
          }}
        >
          {uniqueItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
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
                {/* <div className="absolute inset-0 flex items-center justify-center bg-slate-100 -z-10">
                  <FolderOpen className="w-10 h-10 text-slate-300" />
                </div> */}
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
          ))}
        </div>
      )}
    </div>
  );
}
