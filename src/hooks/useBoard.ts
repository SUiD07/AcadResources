import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
// import { getBoardContent, saveBoardContentData } from '../lib/dataservice';
import { getBoardContent, saveBoardContentData } from '../lib/dataService';

export function useBoard(boardId: string | null) {
  const [content, setContent] = useState<object>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
  if (!boardId) return;
  setLoading(true);
  getBoardContent(boardId).then((data) => {
    console.log('board content:', data); // ← เพิ่ม log
    setContent(data?.content ?? {});
    setLoading(false);
  });
}, [boardId]);

  const save = useDebouncedCallback(async (newContent: object) => {
    if (!boardId) return;
    setSaving(true);
    try {
      await saveBoardContentData(boardId, newContent);
    } finally {
      setSaving(false);
    }
  }, 1200);

  return { content, loading, saving, save };
}