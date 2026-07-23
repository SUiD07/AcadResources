import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getActivityById } from '../../lib/dataService';
import { useActivityContent } from '../../hooks/useActivityContent';
import { Editor } from '../board/Editor';
import type { Activity } from '../../lib/types';

interface Props {
  isAdmin?: boolean;
}

export function ActivityDetail({ isAdmin = false }: Props) {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(true);

  const { content, loading: loadingContent, saving, save } = useActivityContent(id ?? null);

  useEffect(() => {
    if (!id) return;
    setLoadingActivity(true);
    getActivityById(id).then((data) => {
      setActivity(data);
      setLoadingActivity(false);
    });
  }, [id]);

  if (loadingActivity) {
    return <div className="py-20 text-center text-slate-400 text-sm">กำลังโหลด...</div>;
  }

  if (!activity) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        ไม่พบกิจกรรมนี้
        <div className="mt-4">
          <Link to="/activities" className="text-[#E5007D] hover:underline">
            กลับไปหน้ากิจกรรม
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 lg:pb-8">
      <Link
        to="/activities"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#E5007D] mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> กลับ
      </Link>

      <h1 className="text-slate-900 text-[24px] font-bold mb-1">{activity.title}</h1>
      <p className="text-slate-600 text-sm mb-6">{activity.description}</p>

      {loadingContent ? (
        <div className="py-12 text-center text-slate-400 text-sm">กำลังโหลดเนื้อหา...</div>
      ) : (
        <div className="relative">
          {saving && (
            <span className="absolute top-0 right-0 text-xs text-slate-400">กำลังบันทึก...</span>
          )}
          <Editor
            boardId={activity.id}
            initialContent={content}
            onSave={save}
            isAdmin={isAdmin}
          />
        </div>
      )}
    </div>
  );
}