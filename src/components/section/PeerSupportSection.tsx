import { useState, useMemo, useEffect } from "react";
import { FilterBar, filterBlocksByYear } from "../FilterBar";
import { ContentCategory } from "../ContentCategory";
import {
  getStudentDocuments,
  updateStudentDocument,
  deleteStudentDocument,
} from "../../lib/dataService";
import type { StudentDocument, PeerSupportItem } from "../../lib/types";
import * as googleDrive from "../../lib/googleDriveService";
import { detectDocType, detectBlock, detectGeneration, SUBJECT_YEAR_MAP } from "../categorize";
import { Button } from "../ui/button";
import { Plus, Search, RefreshCcw, ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "../ui/use-mobile";
import {
  AddResourceDialog,
  type ResourceFormData,
} from "../admin/AddResourceDialog";
import { EditResourceDialog } from "../admin/EditResourceDialog";
import { DeleteConfirmDialog } from "../admin/DeleteConfirmDialog";

// ─── TYPE ORDER ─────────────────────────────────────────────────────────────
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

interface SubjectCardProps {
  subject: string;
  items: PeerSupportItem[];
  isAdmin: boolean;
  onEdit?: (item: PeerSupportItem) => void;
  onDelete?: (item: PeerSupportItem) => void;
}

function SubjectCard({
  subject,
  items,
  isAdmin,
  onEdit,
  onDelete,
}: SubjectCardProps) {
  const [expanded, setExpanded] = useState(false);

  const typesPresent = [
    ...DOC_TYPE_ORDER.filter((t) => items.some((i) => i.category === t)),
    ...(items.some(
      (i) =>
        !i.category ||
        i.category === "Unknown" ||
        !DOC_TYPE_ORDER.includes(i.category),
    )
      ? ["ไม่ระบุประเภท"]
      : []),
  ];

  const gens = [...new Set(items.map((i) => i.generation))]
    .filter((g) => g !== "Auto-Detected")
    .sort((a, b) => b.localeCompare(a));

  const hasUnknownGen = items.some(
    (i) => !i.generation || i.generation === "Auto-Detected",
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-3">
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
                {t} ({items.filter((i) => i.category === t || (t === "ไม่ระบุประเภท" && (!i.category || i.category === "Unknown"))).length}){" "}
              </span>
            ))}
            {gens.map((g) => (
              <span key={g} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F1F5F9", color: "#64748B" }}>
                {g}
              </span>
            ))}
            {hasUnknownGen && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F1F5F9", color: "#94A3B8" }}>
                ไม่ระบุรุ่น
              </span>
            )}
          </div>
        </div>
        <span className="text-slate-400 ml-4 shrink-0">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 sm:px-6 py-4 space-y-3 bg-slate-50/50">
          {typesPresent.map((type) => (
            <ContentCategory
              key={type}
              categoryName={type}
              items={
                type === "ไม่ระบุประเภท"
                  ? items.filter((i) => !i.category || i.category === "Unknown")
                  : items.filter((i) => i.category === type)
              }
              isAdmin={isAdmin}
              defaultExpanded={type === "Precourse"}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PeerSupportSection({
  isAdmin = false,
  isMobile = false,
}: PeerSupportSectionProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<(ResourceFormData & { id: string }) | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string } | null>(null);

  const handleAdd = async (data: ResourceFormData) => {
    // Manual additions are currently disabled for student_documents as they sync from Drive.
    // To add a resource, upload it to the designated Google Drive folder.
    console.log("Add ignored: New resources should be uploaded to Google Drive.", data);
  };

  const handleEdit = async (data: ResourceFormData & { id: string }) => {
    // Strip "doc-" prefix and convert to number for student_documents
    const docId = parseInt(data.id.replace("doc-", ""), 10);
    
    // Map ResourceFormData back to StudentDocument partial
    // This allows admins to "fix keys" in the database
    const updates: any = {
      block: data.block,
      doc_type: data.category,
      generation: parseInt(data.generation.replace("MDCU ", ""), 10) || 0,
    };

    await updateStudentDocument(docId, updates);
    const updated = await getStudentDocuments();
    setStudentDocs(updated);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    const docId = parseInt(deletingItem.id.replace("doc-", ""), 10);
    await deleteStudentDocument(docId);
    const updated = await getStudentDocuments();
    setStudentDocs(updated);
  };

  const isMobileScreen = useIsMobile();
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<string[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);

  const [studentDocs, setStudentDocs] = useState<StudentDocument[]>([]);
  const [peerItems, setPeerItems] = useState<PeerSupportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const docs = await getStudentDocuments();
        setStudentDocs(docs);
      } catch (error) {
        console.error("Error loading documents:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const allItems = useMemo<PeerSupportItem[]>(
    () => {
      // Convert student docs to PeerSupportItem format and auto-categorize
      return studentDocs.map((doc) => {
        const finalBlock = doc.block && doc.block !== 'Other' && doc.block !== 'Unclassified'
          ? doc.block
          : detectBlock(doc.title, doc.folder_path);
          
        const finalCategory = doc.doc_type && doc.doc_type !== 'Other' && doc.doc_type !== 'Unknown'
          ? doc.doc_type
          : detectDocType(doc.title);

        return {
          id: `doc-${doc.id}`,
          block_name: doc.title,
          thumbnail: "", // Handled by ContentCategory fallback
          drive_link: doc.file_url,
          generation: doc.generation && doc.generation !== 0 
            ? `MDCU ${doc.generation}` 
            : detectGeneration(doc.title, doc.folder_path),
          block: finalBlock,
          category: finalCategory,
        };
      });
    },
    [studentDocs],
  );

  const filterOptions = useMemo(() => {
    const genSet = new Set(allItems.map((d) => d.generation).filter((g) => g !== "Auto-Detected"));
    const blockSet = new Set(allItems.map((d) => d.block));
    const typeSet = new Set(allItems.map((d) => d.category));
    return {
      generations: [...genSet].sort((a, b) => b.localeCompare(a)),
      blocks: [...blockSet].sort(),
      types: DOC_TYPE_ORDER.filter((t) => typeSet.has(t)),
    };
  }, [allItems]);

  useEffect(() => {
    if (selectedYear.length === 0) return;
    const validBlocks = filterBlocksByYear(filterOptions.blocks, selectedYear);
    const stillValid = selectedBlock.filter((b) => validBlocks.includes(b));
    if (stillValid.length !== selectedBlock.length) setSelectedBlock(stillValid);
  }, [selectedYear]);

  const filteredItems = useMemo(
    () =>
      allItems.filter((item) => {
        if (selectedYear.length > 0) {
          const year = SUBJECT_YEAR_MAP[item.block];
          const yearStr = year === undefined ? "other" : String(year);
          if (!selectedYear.includes(yearStr)) return false;
        }

        const genVal = !item.generation || item.generation === "Auto-Detected" ? "other" : item.generation;
        const genMatch = selectedGeneration.length === 0 || (genVal === "other" ? selectedGeneration.includes("other") || selectedGeneration.length === 0 : selectedGeneration.some((g) => genVal.includes(g.replace("MDCU ", ""))));

        const blockVal = !item.block || item.block === "Unclassified" ? "other" : item.block;
        const blockMatch = selectedBlock.length === 0 || (blockVal === "other" ? selectedBlock.includes("other") || selectedBlock.length === 0 : selectedBlock.includes(blockVal));

        const catVal = !item.category || item.category === "Unknown" || !DOC_TYPE_ORDER.includes(item.category) ? "other" : item.category;
        const catMatch = selectedCategory.length === 0 || (catVal === "other" ? selectedCategory.includes("other") || selectedCategory.length === 0 : selectedCategory.includes(catVal));

        return genMatch && blockMatch && catMatch;
      }),
    [allItems, selectedYear, selectedGeneration, selectedBlock, selectedCategory],
  );

  const groupedBySubject = useMemo(() => {
    const map: Record<string, PeerSupportItem[]> = {};
    filteredItems.forEach((item) => {
      const key = item.block && item.block !== "Unclassified" ? item.block : "ไม่ระบุวิชา";
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return Object.entries(map)
      .sort(([a], [b]) => {
        if (a === "ไม่ระบุวิชา") return 1;
        if (b === "ไม่ระบุวิชา") return -1;
        return a.localeCompare(b);
      })
      .map(([subject, items]) => ({ subject, items }));
  }, [filteredItems]);

  return (
    <div className="pb-20 lg:pb-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h1 className="text-slate-900 font-bold text-[24px]">Peer Support Resources</h1>
          {isAdmin && (
            <Button size="sm" onClick={() => setAddDialogOpen(true)} className="bg-[#E5007D] hover:bg-[#c00069] text-white">
              <Plus className="w-4 h-4 mr-2" /> Add New Resource
            </Button>
          )}
        </div>
        <p className="text-slate-600 text-sm sm:text-base">Browse and access peer-created academic materials</p>
      </div>

      <div style={{ display: "flex", flexDirection: isMobileScreen ? "column" : "row", gap: 20, alignItems: "flex-start" }}>
        <div style={{ width: isMobileScreen ? "100%" : 230, flexShrink: 0, position: isMobileScreen ? "static" : "sticky", top: 20, maxHeight: isMobileScreen ? "auto" : "calc(100vh - 40px)", overflowY: isMobileScreen ? "visible" : "auto" }}>
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
            isMobile={isMobileScreen}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <RefreshCcw className="w-6 h-6 text-[#E5007D] animate-spin mr-2" />
              <div className="text-slate-600">Loading...</div>
            </div>
          )}

          {!isLoading && (
            <div className="text-xs text-slate-400 mb-3">
              พบ {filteredItems.length} รายการ จาก {groupedBySubject.length} วิชา
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
                    onEdit={(item) => {
                      setEditingItem({ id: item.id, blockName: item.block_name, blockCode: "", generation: item.generation, block: item.block, category: item.category, driveLink: item.drive_link, thumbnail: item.thumbnail });
                      setEditDialogOpen(true);
                    }}
                    onDelete={(item) => {
                      setDeletingItem({ id: item.id, name: item.block_name });
                      setDeleteDialogOpen(true);
                    }}
                  />
                ))
              : (
                  <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                    <br />
                    <Search className="w-12 h-12 text-slate-300 mx-auto " />
                    <h3 className="text-slate-900 font-medium ">No resources found</h3>
                    <p className="text-slate-500 text-sm">Try adjusting your filters.</p>
                    <br />
                  </div>
                ))}
        </div>
      </div>

      <AddResourceDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSubmit={handleAdd} />
      <EditResourceDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} onSubmit={handleEdit} initialData={editingItem ?? undefined} />
      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} itemName={deletingItem?.name ?? ""} />
    </div>
  );
}