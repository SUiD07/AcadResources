"use client";

import * as React from "react";
import { Search, Plus, X } from "lucide-react";
import { SUBJECT_YEAR_MAP } from "./categorize";
import type { PeerSupportItem } from "../lib/types";

// ─── FIELD OPTIONS ────────────────────────────────────────────────────────────
export type SearchField = "name" | "block" | "year" | "generation" | "category";

const FIELD_LABELS: Record<SearchField, string> = {
  name: "ชื่อไฟล์",
  block: "Block",
  year: "ชั้นปี",
  generation: "รุ่น",
  category: "ประเภทเอกสาร",
};

const FIELD_OPTIONS: SearchField[] = [
  "name",
  "block",
  "year",
  "generation",
  "category",
];

// ─── SEARCH BOX (1 กล่อง = field + term) ─────────────────────────────────────
export interface SearchBox {
  id: string;
  field: SearchField;
  term: string;
}

export type LogicOp = "AND" | "OR";

interface SearchBarProps {
  boxes: SearchBox[];
  operators: LogicOp[]; // length = boxes.length - 1, อยู่ระหว่างกล่อง i กับ i+1
  onChange: (boxes: SearchBox[], operators: LogicOp[]) => void;
}

let idCounter = 0;
function newId() {
  idCounter += 1;
  return `box-${Date.now()}-${idCounter}`;
}

export function createEmptyBox(field: SearchField = "name"): SearchBox {
  return { id: newId(), field, term: "" };
}

// ─── matching logic สำหรับ 1 กล่อง ────────────────────────────────────────────
function matchBox(item: PeerSupportItem, box: SearchBox): boolean {
  const term = box.term.trim().toLowerCase();
  if (!term) return true; // กล่องว่าง = ไม่กรอง (ผ่านเสมอ)

  switch (box.field) {
    case "name":
      return item.block_name.toLowerCase().includes(term);
    case "block":
      return item.block.toLowerCase().includes(term);
    case "generation":
      return item.generation.toLowerCase().includes(term);
    case "category":
      return item.category.toLowerCase().includes(term);
    case "year": {
      const year = SUBJECT_YEAR_MAP[item.block];
      const yearStr = year === undefined ? "other" : String(year);
      // รองรับพิมพ์ "1" หรือ "other" หรือ "ปี1" ฯลฯ
      const normalizedTerm = term.replace("ปี", "").trim();
      return yearStr === normalizedTerm || yearStr.includes(normalizedTerm);
    }
    default:
      return true;
  }
}

// ─── ประเมินผลลัพธ์ทั้งหมด: ซ้าย → ขวา ตาม operator ───────────────────────────
// box1 AND box2 OR box3  =  (box1 AND box2) OR box3
export function evaluateSearch(
  item: PeerSupportItem,
  boxes: SearchBox[],
  operators: LogicOp[],
): boolean {
  const activeBoxes = boxes.filter((b) => b.term.trim() !== "");
  if (activeBoxes.length === 0) return true; // ไม่มีกล่องไหน active เลย = ผ่านหมด

  let result = matchBox(item, boxes[0]);
  for (let i = 1; i < boxes.length; i++) {
    const op = operators[i - 1] ?? "AND";
    const current = matchBox(item, boxes[i]);
    result = op === "AND" ? result && current : result || current;
  }
  return result;
}

// ─── SINGLE SEARCH BOX UI ─────────────────────────────────────────────────────
function SearchBoxInput({
  box,
  onUpdate,
  onRemove,
  canRemove,
}: {
  box: SearchBox;
  onUpdate: (box: SearchBox) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        border: "1.5px solid #E2E8F0",
        borderRadius: 9,
        overflow: "hidden",
        background: "white",
        flex: "1 1 220px",
        minWidth: 200,
      }}
    >
      <select
        value={box.field}
        onChange={(e) =>
          onUpdate({ ...box, field: e.target.value as SearchField })
        }
        style={{
          border: "none",
          borderRight: "1.5px solid #E2E8F0",
          background: "#F8FAFC",
          color: "#475569",
          fontSize: 12,
          fontWeight: 600,
          padding: "0 8px",
          outline: "none",
          cursor: "pointer",
        }}
      >
        {FIELD_OPTIONS.map((f) => (
          <option key={f} value={f}>
            {FIELD_LABELS[f]}
          </option>
        ))}
      </select>

      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Search
          size={13}
          color="#94A3B8"
          style={{ position: "absolute", left: 8 }}
        />
        <input
          value={box.term}
          onChange={(e) => onUpdate({ ...box, term: e.target.value })}
          placeholder={`ค้นหา${FIELD_LABELS[box.field]}...`}
          style={{
            border: "none",
            outline: "none",
            fontSize: 13,
            padding: "8px 8px 8px 28px",
            width: "100%",
            color: "#0F172A",
          }}
        />
      </div>

      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            border: "none",
            background: "transparent",
            color: "#CBD5E1",
            cursor: "pointer",
            padding: "0 8px",
            display: "flex",
            alignItems: "center",
          }}
          aria-label="ลบกล่องค้นหา"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ─── OPERATOR TOGGLE (AND/OR ระหว่างกล่อง) ───────────────────────────────────
function OperatorToggle({
  value,
  onChange,
}: {
  value: LogicOp;
  onChange: (v: LogicOp) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(value === "AND" ? "OR" : "AND")}
      style={{
        flexShrink: 0,
        padding: "6px 12px",
        borderRadius: 999,
        border: "none",
        background: value === "AND" ? "#E0F2FE" : "#FCE7F3",
        color: value === "AND" ? "#0369A1" : "#BE185D",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.04em",
        cursor: "pointer",
      }}
      title="คลิกเพื่อสลับ AND / OR"
    >
      {value}
    </button>
  );
}

// ─── SEARCH BAR (main export) ────────────────────────────────────────────────
export function SearchBar({ boxes, operators, onChange }: SearchBarProps) {
  const updateBox = (index: number, updated: SearchBox) => {
    const next = [...boxes];
    next[index] = updated;
    onChange(next, operators);
  };

  const removeBox = (index: number) => {
    const nextBoxes = boxes.filter((_, i) => i !== index);
    const opIndex = index === 0 ? 0 : index - 1;
    const nextOps = operators.filter((_, i) => i !== opIndex);
    onChange(nextBoxes, nextOps);
  };

  const addBox = () => {
    const nextBoxes = [...boxes, createEmptyBox()];
    const nextOps = [...operators, "AND" as LogicOp];
    onChange(nextBoxes, nextOps);
  };

  const updateOperator = (index: number, value: LogicOp) => {
    const next = [...operators];
    next[index] = value;
    onChange(boxes, next);
  };

  const clearAll = () => {
    onChange([createEmptyBox()], []);
  };

  const hasActiveSearch = boxes.some((b) => b.term.trim() !== "");

  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        border: "1px solid #E2E8F0",
        padding: 16,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            // color: "#64748B",
            // letterSpacing: "0.07em",
          }}
        >
          Advanced Search
        </span>
        {hasActiveSearch && (
          <span
            onClick={clearAll}
            style={{
              fontSize: 11,
              color: "#EF4444",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Clear
          </span>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
        }}
      >
        {boxes.map((box, i) => (
          <React.Fragment key={box.id}>
            <SearchBoxInput
              box={box}
              onUpdate={(updated) => updateBox(i, updated)}
              onRemove={() => removeBox(i)}
              canRemove={boxes.length > 1}
            />
            {i < boxes.length - 1 && (
              <OperatorToggle
                value={operators[i] ?? "AND"}
                onChange={(v) => updateOperator(i, v)}
              />
            )}
          </React.Fragment>
        ))}

        <button
          type="button"
          onClick={addBox}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "8px 12px",
            borderRadius: 9,
            border: "1.5px dashed #CBD5E1",
            background: "transparent",
            color: "#64748B",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Plus size={14} />
          เพิ่มกล่อง
        </button>
      </div>
    </div>
  );
}
