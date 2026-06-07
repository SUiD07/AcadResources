import { useState } from "react";
import {
  ExternalLink,
  FolderOpen,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// ─── TYPE COLORS (ตรงกับ v5) ──────────────────────────────────────────────────
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
  // ── ใหม่: เปิด accordion ตั้งแต่แรกหรือไม่ (default: false) ──
  defaultExpanded?: boolean;
}

export function ContentCategory({
  categoryName,
  items,
  isAdmin = false,
  defaultExpanded = false,
}: ContentCategoryProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (items.length === 0) return null;

  const accentColor = TYPE_COLORS[categoryName] ?? "#6B7280";
  const isPrecourse = categoryName === "Precourse";

  const handleEdit = (itemId: string) => {
    console.log("Edit item:", itemId);
    // Mock edit functionality
  };

  const handleDelete = (itemId: string) => {
    console.log("Delete item:", itemId);
    // Mock delete functionality
  };

  const handleAddNew = () => {
    console.log("Add new item to category:", categoryName);
    // Mock add functionality
  };

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: isPrecourse ? "#F0F9FF" : "white",
        borderColor: isPrecourse ? "#BAE6FD" : "#E2E8F0",
      }}
    >
      {/* ── Accordion Header (กดเปิด/ปิด) ── */}
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
          {/* Category color dot */}
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
              {items.length} resource{items.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Generation badges (preview while collapsed) */}
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

          {isAdmin && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAddNew();
              }}
              className="bg-[#E5007D] hover:bg-[#c00069] text-white hidden sm:flex"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          )}

          {/* Chevron */}
          <span style={{ color: "#94A3B8" }}>
            {expanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </span>
        </div>
      </div>

      {/* ── Accordion Body (เนื้อหาเดิม ไม่เปลี่ยน) ── */}
      {expanded && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-slate-600">
                    Block Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-slate-600">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-slate-600">
                    Generation
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-slate-600">
                    Action
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs text-slate-600">
                      Admin
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {item.block_code && (
                        <div className="text-xs text-slate-500 mb-1">
                          {item.block_code}
                        </div>
                      )}
                      <div className="text-slate-900">{item.block_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <ImageWithFallback
                        src={item.thumbnail}
                        alt={item.block_name}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-pink-50 text-[#E5007D]">
                        {item.generation}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={item.drive_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          <FolderOpen className="w-4 h-4" />
                          Open Drive
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item.id)}
                            className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex gap-3">
                  <ImageWithFallback
                    src={item.thumbnail}
                    alt={item.block_name}
                    className="w-20 h-20 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    {item.block_code && (
                      <div className="text-xs text-slate-500 mb-1">
                        {item.block_code}
                      </div>
                    )}
                    <h4 className="text-slate-900 mb-2 line-clamp-2">
                      {item.block_name}
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-pink-50 text-[#E5007D] mb-3">
                      {item.generation}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <a
                      href={item.drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Open Drive
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item.id)}
                        className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
