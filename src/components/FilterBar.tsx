import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

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
  const generations = ['MDCU 81', 'MDCU 80', 'MDCU 79', 'MDCU 78', 'MDCU 77', 'MDCU 76', 'ทั้งหมด'];
  const blocks = [
    'Block 1.1',
    'Block 1.2',
    'Block 2.1',
    'Block 2.2',
    'Block 3.1',
    'Clinical Neuroscience',
    'Cardiovascular System',
    'ทั้งหมด',
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-slate-600" />
        <h2 className="text-slate-900">Filter Resources</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-700 mb-2 font-[Sarabun]">เลือกรุ่น</label>
          <Select value={selectedGeneration} onValueChange={onGenerationChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {generations.map((gen) => (
                <SelectItem key={gen} value={gen}>
                  {gen}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm text-slate-700 mb-2 font-[Sarabun]">เลือก Block</label>
          <Select value={selectedBlock} onValueChange={onBlockChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {blocks.map((block) => (
                <SelectItem key={block} value={block}>
                  {block}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}