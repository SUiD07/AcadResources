"use client";

import * as React from "react";
import { Filter } from "lucide-react";

// ─── TYPE_COLORS matches v5 artifact ─────────────────────────────────────────
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

// ─── PROPS — multi-select (string[]) instead of single string ─────────────────
export interface FilterBarProps {
  // options derived from DB (pass [] to use built-in defaults)
  generationOptions?: string[];
  blockOptions?: string[];
  categoryOptions?: string[];

  selectedGeneration: string[];
  selectedBlock: string[];
  selectedCategory: string[];

  onGenerationChange: (value: string[]) => void;
  onBlockChange: (value: string[]) => void;
  onCategoryChange: (value: string[]) => void;

  // mobile: filter panel collapsible
  isMobile?: boolean;
}

// ─── DEFAULT OPTIONS (fallback when not passed from DB) ───────────────────────
const DEFAULT_GENERATIONS = [
  "MDCU 81",
  "MDCU 80",
  "MDCU 79",
  "MDCU 78",
  "MDCU 77",
  "MDCU 76",
];
const DEFAULT_BLOCKS = [
  "Block 1.1",
  "Block 1.2",
  "Block 2.1",
  "Block 2.2",
  "Block 3.1",
  "Clinical Neuroscience",
  "Cardiovascular System",
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

// ─── CHECKBOX GROUP ───────────────────────────────────────────────────────────
interface CheckboxGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  colorMap?: Record<string, string>;
  emptyMsg?: string;
}

function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
  colorMap,
  emptyMsg,
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
      {/* Header row */}
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

      {/* Options */}
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
                  {/* Checkbox box */}
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
                  {opt}
                </button>
              );
            })}
          </div>
        ))}
    </div>
  );
}

// ─── ACTIVE CHIPS ─────────────────────────────────────────────────────────────
interface ActiveChipsProps {
  gens: string[];
  blocks: string[];
  types: string[];
  setGens: (v: string[]) => void;
  setBlocks: (v: string[]) => void;
  setTypes: (v: string[]) => void;
  clearAll: () => void;
}

function ActiveChips({
  gens,
  blocks,
  types,
  setGens,
  setBlocks,
  setTypes,
  clearAll,
}: ActiveChipsProps) {
  const chips = [
    ...gens.map((v) => ({
      label: v,
      color: "#E5007D",
      rm: () => setGens(gens.filter((x) => x !== v)),
    })),
    ...blocks.map((v) => ({
      label: v,
      color: "#7C3AED",
      rm: () => setBlocks(blocks.filter((x) => x !== v)),
    })),
    ...types.map((v) => ({
      label: v,
      color: TYPE_COLORS[v] ?? "#6B7280",
      rm: () => setTypes(types.filter((x) => x !== v)),
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
  blockOptions = DEFAULT_BLOCKS,
  categoryOptions = DEFAULT_CATEGORIES,
  selectedGeneration,
  selectedBlock,
  selectedCategory,
  onGenerationChange,
  onBlockChange,
  onCategoryChange,
  isMobile = false,
}: FilterBarProps) {
  const [open, setOpen] = React.useState(!isMobile);

  const activeCount =
    selectedGeneration.length + selectedBlock.length + selectedCategory.length;
  const clearAll = () => {
    onGenerationChange([]);
    onBlockChange([]);
    onCategoryChange([]);
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

      {/* Filter groups */}
      {open && (
        <div style={{ padding: "16px 16px 4px" }}>
          <CheckboxGroup
            label="เลือกรุ่น"
            options={generationOptions}
            selected={selectedGeneration}
            onChange={onGenerationChange}
          />
          <CheckboxGroup
            label="เลือก Block"
            options={blockOptions}
            selected={selectedBlock}
            onChange={onBlockChange}
          />
          <CheckboxGroup
            label="เลือกประเภท"
            options={categoryOptions}
            selected={selectedCategory}
            onChange={onCategoryChange}
            colorMap={TYPE_COLORS}
          />
        </div>
      )}

      {/* Active chips — shown inside the panel */}
      {activeCount > 0 && (
        <div style={{ padding: "0 16px 14px" }}>
          <ActiveChips
            gens={selectedGeneration}
            blocks={selectedBlock}
            types={selectedCategory}
            setGens={onGenerationChange}
            setBlocks={onBlockChange}
            setTypes={onCategoryChange}
            clearAll={clearAll}
          />
        </div>
      )}
    </div>
  );
}

// import * as React from 'react';
// import { Filter, Check, ChevronsUpDown } from 'lucide-react';
// import { cn } from "../lib/utils";
// import { Button } from "../components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "../components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "../components/ui/popover";

// interface FilterBarProps {
//   selectedGeneration: string;
//   selectedBlock: string;
//   onGenerationChange: (value: string) => void;
//   onBlockChange: (value: string) => void;
// }

// interface FilterBarProps {
//   selectedGeneration: string;
//   selectedBlock: string;
//   onGenerationChange: (value: string) => void;
//   onBlockChange: (value: string) => void;
// }

// export function FilterBar({
//   selectedGeneration,
//   selectedBlock,
//   onGenerationChange,
//   onBlockChange,
// }: FilterBarProps) {
//   const generations = ['MDCU 81', 'MDCU 80', 'MDCU 79', 'MDCU 78', 'MDCU 77', 'MDCU 76', 'ทั้งหมด'];
//   const blocks = [
//     'Block 1.1', 'Block 1.2', 'Block 2.1', 'Block 2.2', 'Block 3.1',
//     'Clinical Neuroscience', 'Cardiovascular System', 'ทั้งหมด',
//   ];

//   return (
//     <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
//       <div className="flex items-center gap-2 mb-4">
//         <Filter className="w-5 h-5 text-slate-600" />
//         <h2 className="text-slate-900 font-medium">Filter Resources</h2>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         {/* เลือกปี/รุ่น */}
//         <div className="flex flex-col">
//           <label className="block text-sm text-slate-700 mb-2 font-[Sarabun]">เลือกรุ่น (พิมพ์ค้นหาได้)</label>
//           <input
//             list="gen-list"
//             value={selectedGeneration}
//             onChange={(e) => onGenerationChange(e.target.value)}
//             placeholder="พิมพ์หรือเลือก..."
//             className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <datalist id="gen-list">
//             {generations.map(gen => <option key={gen} value={gen} />)}
//           </datalist>
//         </div>

//         {/* เลือก Block */}
//         <div className="flex flex-col">
//           <label className="block text-sm text-slate-700 mb-2 font-[Sarabun]">เลือก Block (พิมพ์ค้นหาได้)</label>
//           <input
//             list="block-list"
//             value={selectedBlock}
//             onChange={(e) => onBlockChange(e.target.value)}
//             placeholder="พิมพ์หรือเลือก..."
//             className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <datalist id="block-list">
//             {blocks.map(block => <option key={block} value={block} />)}
//           </datalist>
//         </div>
//       </div>
//     </div>
//   );
// }
