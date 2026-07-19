import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { getResourceItemContent, saveResourceItemContentData } from "../lib/dataService";

export function useResourceItemContent(itemId: string | null, categoryId: string | null) {
  const [content, setContent] = useState<object>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!itemId) return;
    setLoading(true);
    getResourceItemContent(itemId).then((data) => {
      setContent(data?.content ?? {});
      setLoading(false);
    });
  }, [itemId]);

  const save = useDebouncedCallback(async (newContent: object) => {
    if (!itemId || !categoryId) return;
    setSaving(true);
    try {
      await saveResourceItemContentData(itemId, categoryId, newContent);
    } finally {
      setSaving(false);
    }
  }, 1200);

  return { content, loading, saving, save };
}