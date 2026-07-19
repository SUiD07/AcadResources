import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { getActivityContent, saveActivityContentData } from '../lib/dataService';

export function useActivityContent(activityId: string | null) {
  const [content, setContent] = useState<object>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activityId) return;
    setLoading(true);
    getActivityContent(activityId).then((data) => {
      setContent(data?.content ?? {});
      setLoading(false);
    });
  }, [activityId]);

  const save = useDebouncedCallback(async (newContent: object) => {
    if (!activityId) return;
    setSaving(true);
    try {
      await saveActivityContentData(activityId, newContent);
    } finally {
      setSaving(false);
    }
  }, 1200);

  return { content, loading, saving, save };
}