import { useState, useMemo, useEffect } from "react";
import { FilterBar } from "./FilterBar";
import { ContentCategory } from "./ContentCategory";
import { getStudentDocuments } from "../lib/dataService";
import type { StudentDocument, PeerSupportItem } from "../lib/types";
import * as googleDrive from "../lib/googleDriveService";
import { detectDocType, detectBlock } from "./categorize";
import { Button } from "./ui/button";
import { Plus, Search, RefreshCcw, ChevronDown, ChevronUp } from "lucide-react";

// ─── TYPE ORDER (Precourse ขึ้นก่อนเสมอ) ─────────────────────────────────────
const DOC_TYPE_ORDER = [
  "Precourse",
  "AC",
  "Summary",
  "Peer Tutoring",
  "Mock Exam",
  "Lab & Spottest",
  "NLE 1",
  "NLE 2",
  "Resources",
  "Survival Guide",
];

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

interface PeerSupportSectionProps {
  isAdmin?: boolean;
  isMobile?: boolean;
}

// ─── SUBJECT CARD ─────────────────────────────────────────────────────────────
// accordion ระดับวิชา → ข้างในมี ContentCategory แยกตาม doc type
interface SubjectCardProps {
  subject: string;
  items: PeerSupportItem[];
  isAdmin: boolean;
}

function SubjectCard({ subject, items, isAdmin }: SubjectCardProps) {
  const [expanded, setExpanded] = useState(false);

  const typesPresent = DOC_TYPE_ORDER.filter((t) =>
    items.some((i) => i.category === t),
  );
  const gens = [...new Set(items.map((i) => i.generation))]
    .filter((g) => g !== "Auto-Detected")
    .sort((a, b) => b.localeCompare(a));

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-3">
      {/* Subject header */}
      <div
        role="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-between cursor-pointer select-none px-4 sm:px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div>
          <h3 className="font-bold text-slate-900 text-base">{subject}</h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {typesPresent.map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: `${TYPE_COLORS[t] ?? "#6B7280"}18`,
                  color: TYPE_COLORS[t] ?? "#6B7280",
                }}
              >
                {t} ({items.filter((i) => i.category === t).length})
              </span>
            ))}
            {gens.map((g) => (
              <span
                key={g}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "#F1F5F9", color: "#64748B" }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>
        <span className="text-slate-400 ml-4 flex-shrink-0">
          {expanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </span>
      </div>

      {/* ข้างใน: ContentCategory accordion แยกตาม doc type */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 sm:px-6 py-4 space-y-3 bg-slate-50/50">
          {typesPresent.map((type) => (
            <ContentCategory
              key={type}
              categoryName={type}
              items={items.filter((i) => i.category === type)}
              isAdmin={isAdmin}
              defaultExpanded={type === "Precourse"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PEER SUPPORT SECTION ─────────────────────────────────────────────────────
export function PeerSupportSection({
  isAdmin = false,
  isMobile = false,
}: PeerSupportSectionProps) {
  // filter state — multi-select string[]
  const [selectedGeneration, setSelectedGeneration] = useState<string[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);

  // data state (ไม่เปลี่ยน)
  const [studentDocs, setStudentDocs] = useState<StudentDocument[]>([]);
  const [driveFiles, setDriveFiles] = useState<googleDrive.DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // Fetch DB data
        const data = await getStudentDocuments();
        setStudentDocs(data);
        
        // Fetch Drive data
        if (googleDrive.getAccessToken()) {
          fetchDriveFiles();
        }
      } catch (error) {
        console.error("Error loading documents:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const fetchDriveFiles = async () => {
    try {
      setIsLoadingDrive(true);
      const files = await googleDrive.listDriveFiles();
      setDriveFiles(files);
    } catch (error) {
      console.error("Error loading Drive files:", error);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // combine DB + Drive
  const allItems = useMemo<PeerSupportItem[]>(
    () => [
      ...studentDocs.map((doc) => ({
        id: doc.id.toString(),
        block_name: doc.title,
        thumbnail:
          "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=100&h=100&fit=crop",
        drive_link: doc.file_url,
        generation: `MDCU ${doc.generation}`,
        block: doc.block,
        category: doc.doc_type,
      })),
      ...driveFiles.map((file) => ({
        id: file.id,
        block_name: file.name,
        thumbnail:
          "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=100&h=100&fit=crop",
        drive_link: file.webViewLink,
        generation: "Auto-Detected",
        block: detectBlock(file.name),
        category: detectDocType(file.name),
      })),
    ],
    [studentDocs, driveFiles],
  );

  // dynamic filter options จากข้อมูลจริง
  const filterOptions = useMemo(() => {
    const genSet = new Set(
      allItems.map((d) => d.generation).filter((g) => g !== "Auto-Detected"),
    );
    const blockSet = new Set(allItems.map((d) => d.block));
    const typeSet = new Set(allItems.map((d) => d.category));
    return {
      generations: [...genSet].sort((a, b) => b.localeCompare(a)),
      blocks: [...blockSet].sort(),
      types: DOC_TYPE_ORDER.filter((t) => typeSet.has(t)),
    };
  }, [allItems]);

  // filter — OR within, AND across
  const filteredItems = useMemo(
    () =>
      allItems.filter((item) => {
        const genMatch =
          selectedGeneration.length === 0 ||
          selectedGeneration.some((g) =>
            item.generation.includes(g.replace("MDCU ", "")),
          );
        const blockMatch =
          selectedBlock.length === 0 || selectedBlock.includes(item.block);
        const catMatch =
          selectedCategory.length === 0 ||
          selectedCategory.includes(item.category);
        return genMatch && blockMatch && catMatch;
      }),
    [allItems, selectedGeneration, selectedBlock, selectedCategory],
  );

  // จัดกลุ่มตาม Block/วิชา
  const groupedBySubject = useMemo(() => {
    const map: Record<string, PeerSupportItem[]> = {};
    filteredItems.forEach((item) => {
      if (!map[item.block]) map[item.block] = [];
      map[item.block].push(item);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([subject, items]) => ({ subject, items }));
  }, [filteredItems]);

  return (
    <div className="pb-20 lg:pb-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h1 className="text-slate-900 font-bold text-[24px]">
            Peer Support Resources
          </h1>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => console.log("Add")}
              className="bg-[#E5007D] hover:bg-[#c00069] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Resource
            </Button>
          )}
        </div>
        <p className="text-slate-600 text-sm sm:text-base">
          Browse and access peer-created academic materials
        </p>
      </div>

      {/* Main layout */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 20,
          alignItems: "flex-start",
        }}
      >
        {/* Filter sidebar */}
        <div style={{ width: isMobile ? "100%" : 230, flexShrink: 0 }}>
          <FilterBar
            generationOptions={filterOptions.generations}
            blockOptions={filterOptions.blocks}
            categoryOptions={filterOptions.types}
            selectedGeneration={selectedGeneration}
            selectedBlock={selectedBlock}
            selectedCategory={selectedCategory}
            onGenerationChange={setSelectedGeneration}
            onBlockChange={setSelectedBlock}
            onCategoryChange={setSelectedCategory}
            isMobile={isMobile}
          />
        </div>

        {/* Results */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {(isLoading || isLoadingDrive) && (
            <div className="flex justify-center items-center py-12">
              <RefreshCcw className="w-6 h-6 text-[#E5007D] animate-spin mr-2" />
              <div className="text-slate-600">
                {isLoading ? "Loading..." : "Syncing Drive files..."}
              </div>
            </div>
          )}

          {!isLoading && (
            <div className="text-xs text-slate-400 mb-3">
              พบ {filteredItems.length} รายการ จาก {groupedBySubject.length}{" "}
              วิชา
              {isLoadingDrive && (
                <span className="ml-2 text-[#E5007D]">
                  ⟳ กำลังโหลด Drive files...
                </span>
              )}
            </div>
          )}

          {!isLoading &&
            (groupedBySubject.length > 0
              ? groupedBySubject.map(({ subject, items }) => (
                  <SubjectCard
                    key={subject}
                    subject={subject}
                    items={items}
                    isAdmin={isAdmin}
                  />
                ))
              : !isLoadingDrive && (
                  <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-slate-900 font-medium">
                      No resources found
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Try adjusting your filters.
                    </p>
                  </div>
                ))}
        </div>
      </div>
    </div>
  );
}
