import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Generation } from '../../lib/types';

interface Props {
  generations: Generation[];
  activeId: string | null;
  onChange: (id: string) => void;
  onAdd: (name: string, slug: string) => void;
  isAdmin?: boolean;
}

export function GenerationTabs({
  generations,
  activeId,
  onChange,
  onAdd,
  isAdmin = false,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    const slug = newName.trim().toLowerCase().replace(/\s+/g, '-');
    onAdd(newName.trim(), slug);
    setNewName('');
    setAdding(false);
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-white overflow-x-auto shrink-0">
      {generations.map((gen) => (
        <button
          key={gen.id}
          onClick={() => onChange(gen.id)}
          className={`
            px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
            ${gen.id === activeId
              ? 'text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
            }
          `}
          style={gen.id === activeId ? { backgroundColor: gen.color ?? '#6366f1' } : {}}
        >
          {gen.name}
        </button>
      ))}

      {/* เพิ่มรุ่น — admin only */}
      {isAdmin && (
        adding ? (
          <div className="flex items-center gap-1 ml-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') setAdding(false);
              }}
              placeholder="ชื่อรุ่น..."
              className="px-2 py-1 text-sm border border-indigo-400 rounded-full outline-none w-28"
            />
            <button
              onClick={handleAdd}
              className="px-3 py-1 text-sm bg-indigo-500 text-white rounded-full hover:bg-indigo-600"
            >
              เพิ่ม
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-2 py-1 text-sm text-gray-500 hover:text-gray-800"
            >
              ยกเลิก
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            เพิ่มรุ่น
          </button>
        )
      )}
    </div>
  );
}