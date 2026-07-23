import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getResourceCategoryById } from "../../lib/dataService";
import { useResourceItemContent } from "../../hooks/useResourceItemContent";
import { useResourceCategoryContent } from "../../hooks/useResourceCategoryContent";
import { Editor } from "../board/Editor";
import type { ResourceCategory, ResourceItem } from "../../lib/types";

interface Props {
  isAdmin?: boolean;
}

function ItemBlock({
  item,
  categoryId,
  isAdmin,
}: {
  item: ResourceItem;
  categoryId: string;
  isAdmin: boolean;
}) {
  const { content, loading, saving, save } = useResourceItemContent(
    item.id,
    categoryId,
  );

  return (
    <div className="mb-8 pb-8 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-slate-900 font-bold text-lg">{item.name}</h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {item.type}
        </span>
      </div>
      {loading ? (
        <div className="py-6 text-center text-slate-400 text-sm">
          กำลังโหลด...
        </div>
      ) : (
        <div className={`relative ${isAdmin ? "" : "compact-editor"}`}>
          {saving && (
            <span className="absolute top-0 right-0 text-xs text-slate-400">
              กำลังบันทึก...
            </span>
          )}
          <Editor
            boardId={item.id}
            initialContent={content}
            onSave={save}
            isAdmin={isAdmin}
          />
        </div>
      )}
    </div>
  );
}

export function ResourceCategoryDetail({ isAdmin = false }: Props) {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<ResourceCategory | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(true);

  const {
    content: generalContent,
    loading: loadingGeneral,
    saving: savingGeneral,
    save: saveGeneral,
  } = useResourceCategoryContent(categoryId ?? null);

  useEffect(() => {
    if (!categoryId) return;
    setLoadingCategory(true);
    getResourceCategoryById(categoryId).then((data) => {
      console.log("category data:", data);
      console.log("items:", data?.items);
      setCategory(data);
      setLoadingCategory(false);
    });
  }, [categoryId]);

  if (loadingCategory) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        กำลังโหลด...
      </div>
    );
  }

  if (!category) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        ไม่พบหมวดหมู่นี้
        <div className="mt-4">
          <Link to="/resources" className="text-[#E5007D] hover:underline">
            กลับไปหน้า Resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 lg:pb-8">
      <Link
        to="/resources"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#E5007D] mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> กลับ
      </Link>
      
      {category.image_url && (
        <div className="w-full h-56 rounded-2xl overflow-hidden mb-6">
          <img
            src={category.image_url}
            alt={category.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <h1 className="text-slate-900 text-[24px] font-bold mb-1">
        {category.title}
      </h1>
      <p className="text-slate-500 text-sm mb-8">{category.description}</p>

      {(category.items ?? []).map((item) => (
        <ItemBlock
          key={item.id}
          item={item}
          categoryId={category.id}
          isAdmin={isAdmin}
        />
      ))}

      <div className="mt-8 pt-8 border-t border-slate-200">
        <h3 className="text-slate-900 font-bold text-lg mb-3">
          รายละเอียดเพิ่มเติม
        </h3>
        {loadingGeneral ? (
          <div className="py-6 text-center text-slate-400 text-sm">
            กำลังโหลด...
          </div>
        ) : (
          <div className="relative compact-editor">
            {savingGeneral && (
              <span className="absolute top-0 right-0 text-xs text-slate-400">
                กำลังบันทึก...
              </span>
            )}
            <Editor
              boardId={category.id}
              initialContent={generalContent}
              onSave={saveGeneral}
              isAdmin={isAdmin}
            />
          </div>
        )}
      </div>
    </div>
  );
}
