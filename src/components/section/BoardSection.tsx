import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useGenerations } from "../../hooks/useGenerations";
import {
  getBoards,
  addBoard,
  removeBoard,
  removeGeneration,
} from "../../lib/dataService";
import { useBoard } from "../../hooks/useBoard";
import { Editor } from "../board/Editor";
import type { Board, Generation } from "../../lib/types";

interface Props {
  isAdmin?: boolean;
}

export function BoardSection({ isAdmin = false }: Props) {
  const {
    generations,
    loading: genLoading,
    createGeneration,
  } = useGenerations();

  const [activeGenId, setActiveGenId] = useState<string | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [boardsLoading, setBoardsLoading] = useState(false);

  // Adding states
  const [addingGen, setAddingGen] = useState(false);
  const [newGenName, setNewGenName] = useState("");
  const [addingBoard, setAddingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");

  // Set default generation
  useEffect(() => {
    if (!genLoading && generations.length > 0 && !activeGenId) {
      setActiveGenId(generations[0].id);
    }
  }, [genLoading, generations]);

  // Load boards when generation changes
  useEffect(() => {
    if (!activeGenId) return;
    setBoardsLoading(true);
    setActiveBoardId(null);
    getBoards(activeGenId).then((data) => {
      setBoards(data);
      if (data.length > 0) setActiveBoardId(data[0].id);
      setBoardsLoading(false);
    });
  }, [activeGenId]);

  const handleAddGen = async () => {
    if (!newGenName.trim()) return;
    const slug = newGenName.trim().toLowerCase().replace(/\s+/g, "-");
    const gen = await createGeneration(newGenName.trim(), slug);
    setActiveGenId(gen.id);
    setNewGenName("");
    setAddingGen(false);
  };

  const handleDeleteGen = async (e: React.MouseEvent, gen: Generation) => {
    e.stopPropagation();
    if (!confirm(`ลบรุ่น "${gen.name}" และทุก page ในรุ่นนี้?`)) return;
    await removeGeneration(gen.id);
    const remaining = generations.filter((g) => g.id !== gen.id);
    // generations มาจาก hook ต้อง refetch หรือ update state
    if (activeGenId === gen.id) {
      setActiveGenId(remaining[0]?.id ?? null);
    }
  };

  const handleAddBoard = async () => {
    if (!newBoardTitle.trim() || !activeGenId) return;
    const maxOrder = boards.reduce((m, b) => Math.max(m, b.order_index), -1);
    const board = await addBoard({
      generation_id: activeGenId,
      title: newBoardTitle.trim(),
      icon: null,
      cover_url: null,
      order_index: maxOrder + 1,
      is_published: false,
      created_by: null,
    });
    setBoards((prev) => [...prev, board]);
    setActiveBoardId(board.id);
    setNewBoardTitle("");
    setAddingBoard(false);
  };

  const handleDeleteBoard = async (e: React.MouseEvent, board: Board) => {
    e.stopPropagation();
    if (!confirm(`ลบ "${board.title}" ?`)) return;
    await removeBoard(board.id);
    const remaining = boards.filter((b) => b.id !== board.id);
    setBoards(remaining);
    if (activeBoardId === board.id) {
      setActiveBoardId(remaining[0]?.id ?? null);
    }
  };

  return (
    <div className="pb-20 lg:pb-8">
      {/* Header */}
      <div className={`flex items-start justify-between mb-4 px-6 pt-6}`}>
        <div>
          <h1 className="text-slate-900">Announcements Board</h1>
          <p className="text-slate-500 mt-1">
            Select your generation to see announcements
          </p>
        </div>
      </div>

      {/* ── Generation Tabs ── */}
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        {generations.map((gen) => (
          <button
            key={gen.id}
            onClick={() => setActiveGenId(gen.id)}
            className={`
              px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${
                gen.id === activeGenId
                  ? "text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }
            `}
            style={
              gen.id === activeGenId
                ? { backgroundColor: gen.color ?? "#E5007D" }
                : {}
            }
          >
            {gen.name}
          </button>
        ))}

        {isAdmin &&
          (addingGen ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={newGenName}
                onChange={(e) => setNewGenName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddGen();
                  if (e.key === "Escape") setAddingGen(false);
                }}
                placeholder="ชื่อรุ่น..."
                className="px-3 py-1 text-sm border border-[#E5007D] rounded-full outline-none w-28"
              />
              <button
                onClick={handleAddGen}
                className="px-3 py-1 text-sm bg-[#E5007D] text-white rounded-full hover:bg-[#c00069]"
              >
                เพิ่ม
              </button>
              <button
                onClick={() => {
                  setAddingGen(false);
                  setNewGenName("");
                }}
                className="px-2 py-1 text-sm text-slate-500 hover:text-slate-800"
              >
                ยกเลิก
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingGen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-400 hover:text-[#E5007D] hover:bg-pink-50 rounded-full transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มรุ่น
            </button>
          ))}
      </div>

      {/* ── Page Tabs ── */}
      {activeGenId && (
        <div className="flex items-center gap-1 mb-6 border-b border-slate-200 pb-2 flex-wrap">
          {boardsLoading ? (
            <span className="text-xs text-slate-400 py-1">กำลังโหลด...</span>
          ) : (
            <>
              {boards.map((board) => (
                <div key={board.id} className="relative group">
                  <button
                    onClick={() => setActiveBoardId(board.id)}
                    className={`
                      px-3 py-1.5 text-sm rounded-t transition-all
                      ${
                        board.id === activeBoardId
                          ? "text-[#E5007D] border-b-2 border-[#E5007D] font-medium"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      }
                    `}
                  >
                    {board.title}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={(e) => handleDeleteBoard(e, board)}
                      className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-0.5 bg-white rounded-full shadow-sm hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              {boards.length === 0 && !addingBoard && (
                <span className="text-xs text-slate-400 py-1">
                  ยังไม่มี page
                </span>
              )}

              {isAdmin &&
                (addingBoard ? (
                  <div className="flex items-center gap-1 ml-1">
                    <input
                      autoFocus
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddBoard();
                        if (e.key === "Escape") {
                          setAddingBoard(false);
                          setNewBoardTitle("");
                        }
                      }}
                      placeholder="ชื่อ page..."
                      className="px-2 py-1 text-sm border border-[#E5007D] rounded outline-none w-28"
                    />
                    <button
                      onClick={handleAddBoard}
                      className="px-2 py-1 text-sm bg-[#E5007D] text-white rounded hover:bg-[#c00069]"
                    >
                      เพิ่ม
                    </button>
                    <button
                      onClick={() => {
                        setAddingBoard(false);
                        setNewBoardTitle("");
                      }}
                      className="text-sm text-slate-400 hover:text-slate-700"
                    >
                      ยกเลิก
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingBoard(true)}
                    className="flex items-center gap-1 px-2 py-1.5 text-sm text-slate-400 hover:text-[#E5007D] hover:bg-pink-50 rounded transition-all ml-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่ม page
                  </button>
                ))}
            </>
          )}
        </div>
      )}

      {/* ── Editor ── */}
      {activeBoardId ? (
        <BoardEditor boardId={activeBoardId} isAdmin={isAdmin} />
      ) : (
        !boardsLoading &&
        activeGenId && (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
            {isAdmin ? 'กด "+ เพิ่ม page" เพื่อเริ่มต้น' : "ยังไม่มีเนื้อหา"}
          </div>
        )
      )}
    </div>
  );
}

// แยก component ย่อยเพื่อให้ useBoard re-run เมื่อ boardId เปลี่ยน
function BoardEditor({
  boardId,
  isAdmin,
}: {
  boardId: string;
  isAdmin: boolean;
}) {
  const { content, loading, saving, save } = useBoard(boardId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-600 text-sm">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {saving && (
        <span className="absolute top-0 right-0 text-xs text-slate-400">
          กำลังบันทึก...
        </span>
      )}
      <div className="w-full overflow-hidden">
        <Editor
          boardId={boardId}
          initialContent={content}
          onSave={save}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
