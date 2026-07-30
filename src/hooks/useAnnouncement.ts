import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { getAnnouncement, saveAnnouncementData } from "../lib/dataService";

export function useAnnouncement(slug: string) {
  const [content, setContent] = useState<object>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAnnouncement(slug).then((data) => {
      setContent(data?.content ?? {});
      setLoading(false);
    });
  }, [slug]);

  const save = useDebouncedCallback(async (newContent: object) => {
    setSaving(true);
    try {
      await saveAnnouncementData(slug, newContent);
    } finally {
      setSaving(false);
    }
  }, 1200);

  return { content, loading, saving, save };
}