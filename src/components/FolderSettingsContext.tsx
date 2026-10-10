import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getFolderSettings, saveFolderSettings } from "../lib/dataService";
import {
  buildFolderSettingsMap,
  getDisplayName,
  isPathHidden,
  normalizeFolderPath,
  settingKey,
  sortFolders,
} from "../lib/FolderSettings";
import type { FolderSettingsMap } from "../lib/FolderSettings";
import type { FolderSetting } from "../lib/types";

export type FolderSettingRow = Partial<FolderSetting> & { folder_path: string };

interface FolderSettingsApi {
  displayName: (path: string, fallback: string) => string;
  /** Hidden folder (or hidden ancestor) AND the viewer is not an admin. */
  isHiddenForViewer: (path?: string) => boolean;
  /** This exact folder is flagged hidden (used for the admin badge). */
  isFolderHidden: (path: string) => boolean;
  sortFolders: <T extends { name: string; fullPath: string }>(nodes: T[]) => T[];
  getSetting: (path: string) => FolderSetting | undefined;
  /** Save many folder settings at once. Resolves true on success. */
  saveMany: (rows: FolderSettingRow[]) => Promise<boolean>;
  /** Save a new order for sibling folders (index = sort_order). Updates the screen instantly. */
  reorder: (orderedPaths: string[]) => Promise<void>;
  /** Rename a folder. An empty name (or the Drive name) resets it to the Drive name. */
  rename: (path: string, newName: string, originalName: string) => Promise<void>;
  /** Hide / show a folder for students. */
  setHidden: (path: string, hidden: boolean) => Promise<void>;
}

const DEFAULT_API: FolderSettingsApi = {
  displayName: (_p, fallback) => fallback,
  isHiddenForViewer: () => false,
  isFolderHidden: () => false,
  sortFolders: (nodes) => [...nodes].sort((a, b) => a.name.localeCompare(b.name)),
  getSetting: () => undefined,
  saveMany: async () => false,
  reorder: async () => {},
  rename: async () => {},
  setHidden: async () => {},
};

const FolderSettingsContext = createContext<FolderSettingsApi>(DEFAULT_API);

export function useFolderSettings() {
  return useContext(FolderSettingsContext);
}

export function FolderSettingsProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: ReactNode;
}) {
  const [map, setMap] = useState<FolderSettingsMap>(new Map());

  const load = useCallback(async () => {
    try {
      setMap(buildFolderSettingsMap(await getFolderSettings()));
    } catch (e) {
      console.error("Failed to load folder settings", e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const applyLocal = useCallback((rows: FolderSettingRow[]) => {
    setMap((cur: FolderSettingsMap) => {
      const next: FolderSettingsMap = new Map(cur);
      for (const r of rows) {
        const k = settingKey(r.folder_path);
        const old = next.get(k);
        next.set(k, {
          custom_name: old?.custom_name ?? null,
          sort_order: old?.sort_order ?? null,
          hidden: old?.hidden ?? false,
          ...r,
        } as FolderSetting);
      }
      return next;
    });
  }, []);

  // Persist first; only update local state once the save has succeeded.
  const saveMany = useCallback(
    async (rows: FolderSettingRow[]): Promise<boolean> => {
      if (rows.length === 0) return true;
      const normalized = rows.map((r) => ({ ...r, folder_path: normalizeFolderPath(r.folder_path) }));
      try {
        await saveFolderSettings(normalized);
      } catch (e) {
        console.error("Failed to save folder settings", e);
        alert("Could not save folder settings. Please try again.");
        return false;
      }
      applyLocal(normalized);
      return true;
    },
    [applyLocal],
  );

  // Optimistic: the folder moves on screen immediately, then it is saved.
  // If saving fails, reload the real order from the database.
  const reorder = useCallback(
    async (orderedPaths: string[]) => {
      const rows = orderedPaths.map((p, i) => ({
        folder_path: normalizeFolderPath(p),
        sort_order: i,
      }));
      applyLocal(rows);
      try {
        await saveFolderSettings(rows);
      } catch (e) {
        console.error("Failed to save folder order", e);
        alert("Could not save the new folder order. Please try again.");
        await load();
      }
    },
    [applyLocal, load],
  );

  // Optimistic single-folder save; reloads the real data if the save fails.
  const saveOne = useCallback(
    async (row: FolderSettingRow, errorMessage: string) => {
      const normalized = { ...row, folder_path: normalizeFolderPath(row.folder_path) };
      applyLocal([normalized]);
      try {
        await saveFolderSettings([normalized]);
      } catch (e) {
        console.error(errorMessage, e);
        alert(errorMessage);
        await load();
      }
    },
    [applyLocal, load],
  );

  const rename = useCallback(
    async (path: string, newName: string, originalName: string) => {
      const trimmed = newName.trim();
      const custom = trimmed && trimmed !== originalName ? trimmed : null;
      await saveOne({ folder_path: path, custom_name: custom }, "Could not rename the folder. Please try again.");
    },
    [saveOne],
  );

  const setHidden = useCallback(
    async (path: string, hidden: boolean) => {
      await saveOne({ folder_path: path, hidden }, "Could not update the folder. Please try again.");
    },
    [saveOne],
  );

  const api = useMemo<FolderSettingsApi>(
    () => ({
      displayName: (path, fallback) => getDisplayName(map, path, fallback),
      isHiddenForViewer: (path) => !isAdmin && isPathHidden(map, path),
      isFolderHidden: (path) => map.get(settingKey(path))?.hidden === true,
      sortFolders: (nodes) => sortFolders(map, nodes),
      getSetting: (path) => map.get(settingKey(path)),
      saveMany,
      reorder,
      rename,
      setHidden,
    }),
    [map, isAdmin, saveMany, reorder, rename, setHidden],
  );

  return <FolderSettingsContext.Provider value={api}>{children}</FolderSettingsContext.Provider>;
}
