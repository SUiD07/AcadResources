import { useState, useMemo, useEffect } from "react";
import { FilterBar, filterBlocksByYear } from "../FilterBar";
import { ContentCategory } from "../ContentCategory";
import {
  createStudentDocument,
  getStudentDocuments,
  updateStudentDocument,
  deleteStudentDocument,
  getKeywordConfigs,
} from "../../lib/dataService";
import type { StudentDocument, PeerSupportItem, KeywordConfig } from "../../lib/types";
import * as googleDrive from "../../lib/googleDriveService";
import { initializeCategorizer } from "../categorize";
import { classifyDocument } from "../../lib/KeywordMatching";
import { Button } from "../ui/button";
import { Plus, Search, RefreshCcw, ChevronDown, ChevronUp, LayoutGrid, List } from "lucide-react";
import { useIsMobile } from "../ui/use-mobile";
import { extractDriveId } from "../../lib/supabase";
import {
  AddResourceDialog,
  type ResourceFormData,
} from "../admin/AddResourceDialog";
import { EditResourceDialog } from "../admin/EditResourceDialog";
import { DeleteConfirmDialog } from "../admin/DeleteConfirmDialog";
import { SearchBar, createEmptyBox, evaluateSearch } from "../SearchBar";
import type { SearchBox, LogicOp } from "../SearchBar";
import { Virtuoso } from "react-virtuoso";

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
  "Lecture Slide",
  "Textbook",
  "Checklist",
  "Guideline"
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
  "Lecture Slide": "#06B6D4",
  "Textbook": "#EC4899",
  "Checklist": "#D946EF",
  "Guideline": "#F59E0B"
};

function isUnclassifiedCategory(
  category: string | undefined,
  knownTypes: string[],
) {
  return (
    !category ||
    category === "Unknown" ||
    !knownTypes.includes(category)
  );
}

interface PeerSupportSectionProps {
  isAdmin?: boolean;
  isMobile?: boolean;
  defaultYear?: string;
}

interface SubjectCardProps {
  subject: string;
  items: PeerSupportItem[];
  isAdmin: boolean;
  knownTypes: string[];
  viewMode: "grid" | "list";
  onEdit?: (item: PeerSupportItem) => void;
  onDelete?: (item: PeerSupportItem) => void;
}

function SubjectCard({
  subject,
  items,
  isAdmin,
  knownTypes,
  viewMode,
  onEdit,
  onDelete,
}: SubjectCardProps) {
  const [expanded, setExpanded] = useState(false);

  const typesPresent = [
    ...knownTypes.filter((t) =>
      items.some((i) => i.category === t)
    ),
    ...(items.some((i) =>
      isUnclassifiedCategory(i.category, knownTypes)
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
                {t} (
                {
                  items.filter((i) =>
                    t === "ไม่ระบุประเภท"
                      ? isUnclassifiedCategory(i.category, knownTypes)
                      : i.category === t
                  ).length
                }
                )
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
                  ? items.filter((i) =>
                    isUnclassifiedCategory(i.category, knownTypes)
                  )
                  : items.filter((i) => i.category === type)
              }
              isAdmin={isAdmin}
              defaultExpanded={type === "Precourse"}
              viewMode={viewMode}
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
  defaultYear,
}: PeerSupportSectionProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<(ResourceFormData & { id: string }) | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string } | null>(null);

  // ─── Global view mode ────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleAdd = async (data: ResourceFormData) => {
    const driveId = extractDriveId(data.driveLink);
    const existingDocs = await getStudentDocuments();
    const existingDoc = driveId
      ? existingDocs.find((doc) => doc.drive_id === driveId)
      : null;

    const shouldOverride = Boolean(data.isOverridden ?? existingDoc);

    const generation = Number.parseInt(data.generation.replace("MDCU ", ""), 10) || 0;
    const fallbackTitle = data.blockName || data.driveLink || "Untitled resource";

    const classifiedDoc: StudentDocument = {
      id: existingDoc?.id ?? -1,
      title: fallbackTitle,
      file_url: data.driveLink,
      folder_path: data.blockName || data.driveLink || "",
      uploaded_by: "admin",
      upload_date: new Date().toISOString(),
      block: data.block,
      doc_type: data.category,
      generation,
      thumbnail_url: data.thumbnail || undefined,
      drive_id: driveId ?? undefined,
      board_exam: data.boardExam || undefined,
      is_overridden: shouldOverride,
    };

    if (existingDoc && driveId) {
      const updates: Partial<StudentDocument> = {
        title: fallbackTitle,
        file_url: data.driveLink,
        folder_path: data.blockName || data.driveLink || existingDoc.folder_path || "",
        thumbnail_url: data.thumbnail || undefined,
        generation,
        block: shouldOverride ? data.block : existingDoc.block,
        doc_type: shouldOverride ? data.category : existingDoc.doc_type,
        board_exam: shouldOverride ? (data.boardExam || undefined) : existingDoc.board_exam,
        drive_id: driveId,
        is_overridden: shouldOverride,
      };

      if (!shouldOverride) {
        const blockConfig = classifyDocument(classifiedDoc, configs, "block_mapping");
        const typeConfig = classifyDocument(classifiedDoc, configs, "doc_type");
        const boardConfig = classifyDocument(classifiedDoc, configs, "board_exam");

        updates.block = blockConfig ? blockConfig.label : existingDoc.block || "Unclassified";
        updates.doc_type = typeConfig ? typeConfig.label : existingDoc.doc_type || "Unknown";
        updates.board_exam = boardConfig ? boardConfig.label : undefined;
      }

      await updateStudentDocument(existingDoc.id, updates);
    } else {
      const blockConfig = classifyDocument(classifiedDoc, configs, "block_mapping");
      const typeConfig = classifyDocument(classifiedDoc, configs, "doc_type");
      const boardConfig = classifyDocument(classifiedDoc, configs, "board_exam");

      const recordToCreate: Partial<StudentDocument> = {
        title: fallbackTitle,
        file_url: data.driveLink,
        folder_path: data.blockName || data.driveLink || "",
        uploaded_by: "admin",
        upload_date: new Date().toISOString(),
        block: shouldOverride ? data.block : blockConfig ? blockConfig.label : "Unclassified",
        doc_type: shouldOverride ? data.category : typeConfig ? typeConfig.label : "Unknown",
        generation,
        thumbnail_url: data.thumbnail || undefined,
        drive_id: driveId ?? undefined,
        board_exam: shouldOverride ? (data.boardExam || undefined) : boardConfig ? boardConfig.label : undefined,
        is_overridden: shouldOverride,
      };

      await createStudentDocument(recordToCreate);
    }

    const updated = await getStudentDocuments();
    setStudentDocs(updated);
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
  const [selectedYear, setSelectedYear] = useState<string[]>(defaultYear ? [defaultYear] : []);
  const [selectedGeneration, setSelectedGeneration] = useState<string[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedBoardExam, setSelectedBoardExam] = useState<string[]>([]);

  const [searchBoxes, setSearchBoxes] = useState<SearchBox[]>([createEmptyBox("name")]);
  const [searchOperators, setSearchOperators] = useState<LogicOp[]>([]);

  const [studentDocs, setStudentDocs] = useState<StudentDocument[]>([]);
  const [configs, setConfigs] = useState<KeywordConfig[]>([]);
  const [peerItems, setPeerItems] = useState<PeerSupportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [docs, cfgs] = await Promise.all([getStudentDocuments(), getKeywordConfigs()]);
        initializeCategorizer(cfgs);
        setStudentDocs(docs);
        setConfigs(cfgs);
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
      return studentDocs.map((doc) => {
        const blockConfig = classifyDocument(doc, configs, 'block_mapping');
        const typeConfig = classifyDocument(doc, configs, 'doc_type');
        const boardConfig = classifyDocument(doc, configs, 'board_exam');

        const finalBlock = doc.is_overridden && doc.block
          ? doc.block
          : (blockConfig ? blockConfig.label : 'Unclassified');
        const finalCategory = doc.is_overridden && doc.doc_type
          ? doc.doc_type
          : (typeConfig ? typeConfig.label : 'Unknown');
        const finalBoardExam = doc.is_overridden && doc.board_exam
          ? doc.board_exam
          : (boardConfig ? boardConfig.label : 'None');

        return {
          id: `doc-${doc.id}`,
          block_name: doc.title,
          thumbnail: doc.thumbnail_url || "",
          drive_link: doc.file_url,
          generation: doc.generation && doc.generation !== 0
            ? `MDCU ${doc.generation}`
            : 'Auto-Detected',
          block: finalBlock,
          category: finalCategory,
          board_exam: finalBoardExam,
          folder_path: doc.folder_path,
        };
      });
    },
    [studentDocs, configs],
  );

  const knownDocTypes = useMemo(() => {
    const fromConfigs = configs
      .filter((c) => c.config_type === "doc_type")
      .map((c) => c.label);

    return [...new Set([...DOC_TYPE_ORDER, ...fromConfigs])];
  }, [configs]);

  const filterOptions = useMemo(() => {
    const genSet = new Set(allItems.map((d) => d.generation).filter((g) => g !== "Auto-Detected"));
    const blockSet = new Set(allItems.map((d) => d.block));
    const typeSet = new Set(allItems.map((d) => d.category));
    const boardExamSet = new Set(
      allItems
        .map((d) => d.board_exam)
        .filter((b): b is string => Boolean(b) && b !== "None")
    );
    return {
      generations: [...genSet].sort((a, b) => b.localeCompare(a)),
      blocks: [...blockSet].sort(),
      types: knownDocTypes.filter((t) => typeSet.has(t)),
      boardExams: [...boardExamSet].sort(),
    };
  }, [allItems, knownDocTypes]);

  const yearMap = useMemo(() => {
    const map: Record<string, number | 'other'> = {};
    configs
      .filter(c => c.config_type === 'block_mapping')
      .forEach(c => {
        map[c.label] = c.year === 'other' || !c.year ? 'other' : Number(c.year);
      });
    return map;
  }, [configs]);

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
          const year = yearMap[item.block];
          const yearStr = year === undefined ? "other" : String(year);
          if (!selectedYear.includes(yearStr)) return false;
        }

        const genVal = !item.generation || item.generation === "Auto-Detected" ? "other" : item.generation;
        const genMatch = selectedGeneration.length === 0 || (genVal === "other" ? selectedGeneration.includes("other") || selectedGeneration.length === 0 : selectedGeneration.some((g) => genVal.includes(g.replace("MDCU ", ""))));

        const blockVal = !item.block || item.block === "Unclassified" ? "other" : item.block;
        const blockMatch = selectedBlock.length === 0 || (blockVal === "other" ? selectedBlock.includes("other") || selectedBlock.length === 0 : selectedBlock.includes(blockVal));

        const catVal = isUnclassifiedCategory(
          item.category,
          knownDocTypes,
        )
          ? "other"
          : item.category;
        const catMatch = selectedCategory.length === 0 || (catVal === "other" ? selectedCategory.includes("other") || selectedCategory.length === 0 : selectedCategory.includes(catVal));

        const boardVal = !item.board_exam || item.board_exam === "None" ? "other" : item.board_exam;
        const boardMatch = selectedBoardExam.length === 0 || (boardVal === "other" ? selectedBoardExam.includes("other") || selectedBoardExam.length === 0 : selectedBoardExam.includes(boardVal));

        if (!genMatch || !blockMatch || !catMatch || !boardMatch) return false;
        return evaluateSearch(item, searchBoxes, searchOperators);
      }),
    [allItems, selectedYear, selectedGeneration, selectedBlock, selectedCategory, selectedBoardExam, searchBoxes, searchOperators, yearMap],
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
      <SearchBar
        boxes={searchBoxes}
        operators={searchOperators}
        onChange={(boxes, ops) => {
          setSearchBoxes(boxes);
          setSearchOperators(ops);
        }}
      />

      <div style={{ display: "flex", flexDirection: isMobileScreen ? "column" : "row", gap: 20, alignItems: "flex-start" }}>
        <div style={{ width: isMobileScreen ? "100%" : 230, flexShrink: 0, position: isMobileScreen ? "static" : "sticky", top: 20, maxHeight: isMobileScreen ? "auto" : "calc(100vh - 40px)", overflowY: isMobileScreen ? "visible" : "auto" }}>
          <FilterBar
            generationOptions={filterOptions.generations}
            blockOptions={filterOptions.blocks}
            categoryOptions={filterOptions.types}
            boardExamOptions={filterOptions.boardExams}
            selectedGeneration={selectedGeneration}
            selectedBlock={selectedBlock}
            selectedCategory={selectedCategory}
            selectedBoardExam={selectedBoardExam}
            onGenerationChange={setSelectedGeneration}
            onBlockChange={setSelectedBlock}
            onCategoryChange={setSelectedCategory}
            onBoardExamChange={setSelectedBoardExam}
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

          {/* ── Count row + view toggle ── */}
          {!isLoading && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400">
                พบ {filteredItems.length} รายการ จาก {groupedBySubject.length} วิชา
              </span>
              <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className="flex items-center justify-center px-2.5 py-1.5 transition-colors"
                  style={{
                    background: viewMode === "grid" ? "#E5007D" : "white",
                    color: viewMode === "grid" ? "white" : "#94A3B8",
                  }}
                  title="Grid view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className="flex items-center justify-center px-2.5 py-1.5 transition-colors"
                  style={{
                    background: viewMode === "list" ? "#E5007D" : "white",
                    color: viewMode === "list" ? "white" : "#94A3B8",
                  }}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {!isLoading &&
            (groupedBySubject.length > 0
              ? (
                <Virtuoso
                  style={{ height: "80vh", width: "100%" }}
                  data={groupedBySubject}
                  itemContent={(index, { subject, items }) => (
                    <SubjectCard
                      key={subject}
                      subject={subject}
                      items={items}
                      isAdmin={isAdmin}
                      knownTypes={knownDocTypes}
                      viewMode={viewMode}
                      onEdit={(item) => {
                        setEditingItem({ id: item.id, blockName: item.block_name, generation: item.generation, block: item.block, category: item.category, driveLink: item.drive_link, thumbnail: item.thumbnail });
                        setEditDialogOpen(true);
                      }}
                      onDelete={(item) => {
                        setDeletingItem({ id: item.id, name: item.block_name });
                        setDeleteDialogOpen(true);
                      }}
                    />
                  )}
                />
              )
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