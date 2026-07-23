import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { getResourceCategoryContent, saveResourceCategoryContentData } from "../lib/dataService";

export function useResourceCategoryContent(categoryId: string | null) {
  const [content, setContent] = useState<object>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    getResourceCategoryContent(categoryId).then((data) => {
      setContent(data?.content ?? {});
      setLoading(false);
    });
  }, [categoryId]);

  const save = useDebouncedCallback(async (newContent: object) => {
    if (!categoryId) return;
    setSaving(true);
    try {
      await saveResourceCategoryContentData(categoryId, newContent);
    } finally {
      setSaving(false);
    }
  }, 1200);

  return { content, loading, saving, save };
}