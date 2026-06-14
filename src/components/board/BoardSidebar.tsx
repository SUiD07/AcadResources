import { useState, useEffect } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';
import { getBoards, addBoard, removeBoard } from '../../lib/dataService';
import type { Board } from '../../lib/types';

interface Props {
  generationId: string;
  activeBoardId: string | null;
  onSelectBoard: (board: Board) => void;
  isAdmin?: boolean;
}

export function BoardSidebar({
  generationId,
  activeBoardId,
  onSelectBoard,
  isAdmin = false,
}: Props) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    loadBoards();
  }, [generationId]);

  async function loadBoards() {
    try {
      setIsLoading(true);
      const data = await getBoards(generationId);
      setBoards(data);
      // auto-select first board
      if (data.length > 0 && !activeBoardId) {
        onSelectBoard(data[0]);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddBoard = async () => {
    if (!newTitle.trim()) return;
    const maxOrder = boards.reduce((m, b) => Math.max(m, b.order_index), -1);
    const board = await addBoard({
      generation_id: generationId,
      title: newTitle.trim(),
      icon: null,
      cover_url: null,
      order_index: maxOrder + 1,
      is_published: false,
      created_by: null,
    });
    setBoards((prev) => [...prev, board]);
    onSelectBoard(board);
    setNewTitle('');
    setIsAdding(false);
  };

  const handleDeleteBoard = async (e: React.MouseEvent, board: Board) => {
    e.stopPropagation();
    if (!confirm(`ลบ "${board.title}" ?`)) return;
    await removeBoard(board.id);
    setBoards((prev) => prev.filter((b) => b.id !== board.id));
    if (activeBoardId === board.id && boards.length > 1) {
      const next = boards.find((b) => b.id !== board.id);
      if (next) onSelectBoard(next);
    }
  };

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Pages
        </span>
        {isAdmin && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-indigo-600 transition-colors"
            title="เพิ่ม page"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {isLoading ? (
          <p className="px-3 py-4 text-xs text-gray-400">กำลังโหลด...</p>
        ) : (
          <>
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => onSelectBoard(board)}
                className={`
                  group flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-md mx-1 transition-colors
                  ${board.id === activeBoardId
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <FileText className="w-3.5 h-3.5 shrink-0 opacity-60" />
                <span className="text-sm truncate flex-1">{board.title}</span>

                {isAdmin && (
                  <button
                    onClick={(e) => handleDeleteBoard(e, board)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            {boards.length === 0 && !isAdding && (
              <p className="px-3 py-4 text-xs text-gray-400 text-center">
                ยังไม่มี page
              </p>
            )}
          </>
        )}

        {/* inline add input */}
        {isAdmin && isAdding && (
          <div className="px-2 py-1">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddBoard();
                if (e.key === 'Escape') setIsAdding(false);
              }}
              placeholder="ชื่อ page..."
              className="w-full px-2 py-1 text-sm border border-indigo-300 rounded outline-none"
            />
          </div>
        )}
      </div>
    </aside>
  );
}