"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Filter } from "lucide-react";

import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

interface FilterBarProps {
  selectedGeneration: string;
  selectedBlock: string;
  onGenerationChange: (value: string) => void;
  onBlockChange: (value: string) => void;
}

export function FilterBar({
  selectedGeneration,
  selectedBlock,
  onGenerationChange,
  onBlockChange,
}: FilterBarProps) {
  const generations = [
    "ทั้งหมด",
    "MDCU 81",
    "MDCU 80",
    "MDCU 79",
    "MDCU 78",
    "MDCU 77",
    "MDCU 76",
  ];

  const blocks = [
    "ทั้งหมด",
    "Block 1.1",
    "Block 1.2",
    "Block 2.1",
    "Block 2.2",
    "Block 3.1",
    "Clinical Neuroscience",
    "Cardiovascular System",
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-slate-600" />
        <h2 className="text-slate-900 font-medium">Filter Resources</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FilterSelect
          label="เลือกรุ่น"
          value={selectedGeneration}
          options={generations}
          onChange={onGenerationChange}
        />

        <FilterSelect
          label="เลือก Block"
          value={selectedBlock}
          options={blocks}
          onChange={onBlockChange}
        />
      </div>
    </div>
  );
}

// combobox
function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  // 🔑 state นี้จะเริ่มเป็น null เสมอ
  const [selectedOption, setSelectedOption] = React.useState<string | null>(
    null
  );

  return (
    <div className="flex flex-col">
      <label className="text-sm text-slate-700 mb-2 font-[Sarabun]">
        {label}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {value || "เลือก..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0 z-50" align="start">
          <Command>
            <CommandInput placeholder="พิมพ์ค้นหา..." />

            <CommandList>
              <CommandEmpty>ไม่พบตัวเลือก</CommandEmpty>

              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onChange(option);
                      setSelectedOption(option); // ✅ เกิดจาก user เท่านั้น
                      setOpen(false);
                    }}
                  >
                    {/* <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedOption === option ? "opacity-100" : "opacity-0"
                      )}
                    /> */}
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
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
