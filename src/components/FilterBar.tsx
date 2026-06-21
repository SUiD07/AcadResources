"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { SUBJECT_YEAR_MAP } from "./categorize";

// ─── TYPE_COLORS ──────────────────────────────────────────────────────────────
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

const YEAR_COLORS: Record<string, string> = {
  "1": "#3B82F6",
  "2": "#10B981",
  "3": "#8B5CF6",
  "4": "#F59E0B",
  "5": "#F43F5E",
  "6": "#EC4899",
  other: "#94A3B8",
};

const YEAR_LABELS: Record<string, string> = {
  "1": "ปี 1",
  "2": "ปี 2",
  "3": "ปี 3",
  "4": "ปี 4",
  "5": "ปี 5",
  "6": "ปี 6",
  other: "ไม่ระบุชั้นปี",
};

const CATEGORY_LABELS: Record<string, string> = {
  other: "ไม่ระบุประเภท",
};

const GENERATION_LABELS: Record<string, string> = {
  other: "ไม่ระบุรุ่น",
};

const BLOCK_LABELS: Record<string, string> = {
  other: "ไม่ระบุ Block",
};

const BOARD_EXAM_COLORS: Record<string, string> = {
  NLE1: "#0EA5E9",
  NLE2: "#3B82F6",
  Compre1: "#8B5CF6",
  Compre2: "#A855F7",
  OSCE: "#F59E0B",
  other: "#94A3B8",
};

const BOARD_EXAM_LABELS: Record<string, string> = {
  other: "ไม่ระบุข้อสอบ",
};

// ─── PROPS ────────────────────────────────────────────────────────────────────
export interface FilterBarProps {
  generationOptions?: string[];
  blockOptions?: string[];
  categoryOptions?: string[];
  boardExamOptions?: string[];

  selectedYear: string[];
  selectedGeneration: string[];
  selectedBlock: string[];
  selectedCategory: string[];
  selectedBoardExam: string[];

  onYearChange: (value: string[]) => void;
  onGenerationChange: (value: string[]) => void;
  onBlockChange: (value: string[]) => void;
  onCategoryChange: (value: string[]) => void;
  onBoardExamChange: (values: string[]) => void;

  isMobile?: boolean;
}

// ─── DEFAULT OPTIONS ──────────────────────────────────────────────────────────
const DEFAULT_GENERATIONS = [
  "MDCU 81",
  "MDCU 80",
  "MDCU 79",
  "MDCU 78",
  "MDCU 77",
  "MDCU 76",
];
const DEFAULT_CATEGORIES = [
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

const DEFAULT_BOARD_EXAMS: string[] = [];

// ─── YEAR OPTIONS (เสมอ 1-6 + other) ────────────────────────────────────────
const YEAR_OPTIONS = ["1", "2", "3", "4", "5", "6", "other"];

// ─── helper: กรอง blockOptions ตาม selectedYear ──────────────────────────────
export function filterBlocksByYear(
  blockOptions: string[] | undefined,
  selectedYear: string[] | undefined,
): string[] {
  const safeBlocks = blockOptions ?? [];
  const safeYears = selectedYear ?? [];
  if (safeYears.length === 0) return safeBlocks;
  return safeBlocks.filter((block) => {
    const year = SUBJECT_YEAR_MAP[block];
    if (year === undefined) return safeYears.includes("other");
    return safeYears.includes(String(year));
  });
}

// ─── CHECKBOX GROUP ───────────────────────────────────────────────────────────
interface CheckboxGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  colorMap?: Record<string, string>;
  labelMap?: Record<string, string>;
  emptyMsg?: string;
  chipStyle?: boolean; // แสดงเป็น pill แทน checkbox เล็กๆ
}

function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
  colorMap,
  labelMap,
  emptyMsg,
  chipStyle = false,
}: CheckboxGroupProps) {
  const [open, setOpen] = React.useState(true);

  const toggle = (val: string) =>
    selected.includes(val)
      ? onChange(selected.filter((v) => v !== val))
      : onChange([...selected, val]);

  return (
    <div
      style={{
        borderBottom: "1px solid #F1F5F9",
        paddingBottom: 14,
        marginBottom: 14,
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          marginBottom: open ? 10 : 0,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#64748B",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {selected.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              style={{
                fontSize: 10,
                color: "#E5007D",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Clear
            </span>
          )}
          <span style={{ color: "#94A3B8", fontSize: 11 }}>
            {open ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {open &&
        (options.length === 0 ? (
          <span style={{ fontSize: 12, color: "#CBD5E1", fontStyle: "italic" }}>
            {emptyMsg || "—"}
          </span>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {options.map((opt) => {
              const isActive = selected.includes(opt);
              const color = colorMap?.[opt] ?? "#475569";
              const displayLabel = labelMap?.[opt] ?? opt;

              if (chipStyle) {
                // Year pill style — ใหญ่กว่า มี border radius เต็ม
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(opt)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: 999,
                      border: isActive
                        ? `2px solid ${color}`
                        : "2px solid #E2E8F0",
                      background: isActive ? color : "white",
                      color: isActive ? "white" : "#64748B",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {displayLabel}
                  </button>
                );
              }

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 10px",
                    borderRadius: 7,
                    border: isActive
                      ? `1.5px solid ${color}`
                      : "1.5px solid #E2E8F0",
                    background: isActive ? `${color}18` : "white",
                    color: isActive ? color : "#64748B",
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 13,
                      height: 13,
                      borderRadius: 3,
                      border: isActive
                        ? `2px solid ${color}`
                        : "2px solid #CBD5E1",
                      background: isActive ? color : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isActive && (
                      <span
                        style={{ color: "white", fontSize: 8, fontWeight: 900 }}
                      >
                        ✓
                      </span>
                    )}
                  </span>
                  {displayLabel}
                </button>
              );
            })}
          </div>
        ))}
    </div>
  );
}

// ─── ACTIVE CHIPS ─────────────────────────────────────────────────────────────
function ActiveChips({
  years,
  gens,
  blocks,
  types,
  boardExams,
  setYears,
  setGens,
  setBlocks,
  setTypes,
  setBoardExams,
  clearAll,
}: {
  years: string[];
  gens: string[];
  blocks: string[];
  types: string[];
  boardExams: string[];
  setYears: (v: string[]) => void;
  setGens: (v: string[]) => void;
  setBlocks: (v: string[]) => void;
  setTypes: (v: string[]) => void;
  setBoardExams: (v: string[]) => void;
  clearAll: () => void;
}) {
  const chips = [
    ...years.map((v) => ({
      label: YEAR_LABELS[v] ?? v,
      color: YEAR_COLORS[v] ?? "#64748B",
      rm: () => setYears(years.filter((x) => x !== v)),
    })),
    ...gens.map((v) => ({
      label: GENERATION_LABELS[v] ?? v,
      color: "#E5007D",
      rm: () => setGens(gens.filter((x) => x !== v)),
    })),
    ...blocks.map((v) => ({
      label: BLOCK_LABELS[v] ?? v,
      color: "#7C3AED",
      rm: () => setBlocks(blocks.filter((x) => x !== v)),
    })),
    ...types.map((v) => ({
      label: CATEGORY_LABELS[v] ?? v,
      color: TYPE_COLORS[v] ?? "#6B7280",
      rm: () => setTypes(types.filter((x) => x !== v)),
    })),
    ...boardExams.map((v) => ({
      label: BOARD_EXAM_LABELS[v] ?? v,
      color: BOARD_EXAM_COLORS[v] ?? "#6B7280",
      rm: () => setBoardExams(boardExams.filter((x) => x !== v)),
    })),
  ];
  if (!chips.length) return null;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 12,
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>
        Active:
      </span>
      {chips.map((c, i) => (
        <span
          key={i}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 10px",
            borderRadius: 999,
            background: `${c.color}12`,
            color: c.color,
            border: `1px solid ${c.color}30`,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {c.label}
          <span
            onClick={c.rm}
            style={{
              cursor: "pointer",
              opacity: 0.5,
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ×
          </span>
        </span>
      ))}
      <span
        onClick={clearAll}
        style={{
          fontSize: 12,
          color: "#EF4444",
          cursor: "pointer",
          fontWeight: 600,
          marginLeft: 2,
        }}
      >
        Clear all
      </span>
    </div>
  );
}

// ─── FILTERBAR (main export) ──────────────────────────────────────────────────
export function FilterBar({
  generationOptions = DEFAULT_GENERATIONS,
  blockOptions,
  categoryOptions = DEFAULT_CATEGORIES,
  boardExamOptions = DEFAULT_BOARD_EXAMS,
  selectedYear,
  selectedGeneration,
  selectedBlock,
  selectedCategory,
  selectedBoardExam,
  onYearChange,
  onGenerationChange,
  onBlockChange,
  onCategoryChange,
  onBoardExamChange,
  isMobile = false,
}: FilterBarProps) {
  const [open, setOpen] = React.useState(!isMobile);

  // กรอง block ตาม year ที่เลือก
  const safeBlockOptions = blockOptions ?? [];
  const filteredBlockOptions = [
    ...filterBlocksByYear(safeBlockOptions, selectedYear),
    // "other",
  ];
  // const filteredBlockOptions = filterBlocksByYear(blockOptions, selectedYear);

  // ถ้า year เปลี่ยน → clear block ที่ไม่ได้อยู่ใน filtered แล้ว
  React.useEffect(() => {
    if (selectedYear.length === 0) return;
    const validBlocks = filteredBlockOptions;
    const stillValid = selectedBlock.filter((b) => validBlocks.includes(b));
    if (stillValid.length !== selectedBlock.length) {
      onBlockChange(stillValid);
    }
  }, [selectedYear]);

  const activeCount =
    selectedYear.length +
    selectedGeneration.length +
    selectedBlock.length +
    selectedCategory.length +
    selectedBoardExam.length;

  const clearAll = () => {
    onYearChange([]);
    onGenerationChange([]);
    onBlockChange([]);
    onCategoryChange([]);
    onBoardExamChange([]);
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        border: "1px solid #E2E8F0",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        onClick={() => isMobile && setOpen((o) => !o)}
        style={{
          padding: "14px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: isMobile ? "pointer" : "default",
          borderBottom: open ? "1px solid #F1F5F9" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={16} color="#64748B" />
          <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 14 }}>
            Filter Resources
          </span>
          {activeCount > 0 && (
            <span
              style={{
                padding: "2px 7px",
                borderRadius: 999,
                background: "#FCE7F3",
                color: "#E5007D",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {activeCount}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {activeCount > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              style={{
                fontSize: 11,
                color: "#EF4444",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Reset
            </span>
          )}
          {isMobile && (
            <span style={{ color: "#94A3B8", fontSize: 12 }}>
              {open ? "▲" : "▼"}
            </span>
          )}
        </div>
      </div>

      {open && (
        <div
          style={{
            padding: "16px 16px 4px",
            maxHeight: "60vh",
            overflowY: "scroll",
          }}
        >
          {/* ── Year filter (บนสุด) ── */}
          <CheckboxGroup
            label="เลือกชั้นปี"
            options={YEAR_OPTIONS}
            selected={selectedYear}
            onChange={onYearChange}
            colorMap={YEAR_COLORS}
            labelMap={YEAR_LABELS}
          />

          {/* Block — แสดงเฉพาะวิชาในปีที่เลือก */}
          <CheckboxGroup
            label="เลือก Block"
            options={filteredBlockOptions}
            selected={selectedBlock}
            onChange={onBlockChange}
            labelMap={BLOCK_LABELS}
            emptyMsg={
              selectedYear.length > 0
                ? "ไม่มีรายวิชาในชั้นปีนี้"
                : "— (เลือกชั้นปีเพื่อกรองรายวิชา)"
            }
          />

          <CheckboxGroup
            label="เลือกประเภท"
            options={[...(categoryOptions ?? DEFAULT_CATEGORIES), "other"]}
            selected={selectedCategory}
            onChange={onCategoryChange}
            colorMap={TYPE_COLORS}
            labelMap={CATEGORY_LABELS}
          />

          {/* Board Exam — เฉพาะไฟล์ที่เกี่ยวกับข้อสอบ NLE/Compre/OSCE */}
          <CheckboxGroup
            label="เลือกข้อสอบ"
            options={[...(boardExamOptions ?? DEFAULT_BOARD_EXAMS), "other"]}
            selected={selectedBoardExam}
            onChange={onBoardExamChange}
            colorMap={BOARD_EXAM_COLORS}
            labelMap={BOARD_EXAM_LABELS}
            emptyMsg="— ไม่มีไฟล์ที่ระบุข้อสอบ"
          />

          <CheckboxGroup
            label="เลือกรุ่น"
            options={[...(generationOptions ?? DEFAULT_GENERATIONS), "other"]}
            selected={selectedGeneration}
            onChange={onGenerationChange}
            labelMap={GENERATION_LABELS}
          />
        </div>
      )}

      {activeCount > 0 && (
        <div style={{ padding: "0 16px 14px" }}>
          <ActiveChips
            years={selectedYear}
            gens={selectedGeneration}
            blocks={selectedBlock}
            types={selectedCategory}
            boardExams={selectedBoardExam}
            setYears={onYearChange}
            setGens={onGenerationChange}
            setBlocks={onBlockChange}
            setTypes={onCategoryChange}
            setBoardExams={onBoardExamChange}
            clearAll={clearAll}
          />
        </div>
      )}
    </div>
  );
}