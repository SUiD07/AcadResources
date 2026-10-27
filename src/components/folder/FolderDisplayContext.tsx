import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getFolders, saveFolderEdits } from "../../lib/dataService";
import {
  buildFolderMap,
  buildPathIndex,
  canMoveFolder,
  getDisplayName,
  isChainHidden,
  isVirtualKey,
  resolveChain,
  sortFolders,
} from "../../lib/folderDisplay";
import type { ChainNode, FolderMap, FolderRef } from "../../lib/folderDisplay";
import type { Folder } from "../../lib/types";

/** An admin edit to one folder. `drive_id` is the folder key. */
export type FolderEdit = { drive_id: string } & Partial<
  Pick<Folder, "custom_name" | "sort_order" | "hidden" | "parent_override">
>;

interface FolderSettingsApi {
  /** Folders a file sits in, outermost first (built from the `folders` table, path text as fallback). */
  chainFor: (item: FolderRef) => ChainNode[];
  displayName: (key: string, fallback: string) => string;
  /** The file sits in a hidden folder (or under one) AND the viewer is not an admin. */
  isHiddenForViewer: (item: FolderRef) => boolean;
  /** This exact folder is flagged hidden (used for the admin badge). */
  isFolderHidden: (key: string) => boolean;
  sortFolders: <T extends { name: string; id: string }>(nodes: T[]) => T[];
  /** Save a new order for sibling folders (index = sort_order). Updates the screen instantly. */
  reorder: (orderedKeys: string[]) => Promise<void>;
  /** Rename a folder. An empty name (or the Drive name) resets it to the Drive name. */
  rename: (key: string, newName: string, originalName: string) => Promise<void>;
  /** Hide / show a folder for students. */
  setHidden: (key: string, hidden: boolean) => Promise<void>;
  /** The folder has been moved away from its Drive location (display only). */
  isMoved: (key: string) => boolean;
  /** Can this folder go inside the target? False for itself, its subfolders and virtual folders. */
  canMoveTo: (key: string, targetKey: string) => boolean;
  /** Show the folder inside the target folder. Never changes Drive. */
  moveTo: (key: string, targetKey: string) => Promise<void>;
  /** Put the folder back where it is in Drive. */
  resetMove: (key: string) => Promise<void>;
}

const DEFAULT_API: FolderSettingsApi = {
  chainFor: () => [],
  displayName: (_k, fallback) => fallback,
  isHiddenForViewer: () => false,
  isFolderHidden: () => false,
  sortFolders: (nodes) => [...nodes].sort((a, b) => a.name.localeCompare(b.name)),
  reorder: async () => {},
  rename: async () => {},
  setHidden: async () => {},
  isMoved: () => false,
  canMoveTo: () => false,
  moveTo: async () => {},
  resetMove: async () => {},
};

const FolderSettingsContext = createContext<FolderSettingsApi>(DEFAULT_API);

export function useFolderSettings() {
  return useContext(FolderSettingsContext);
}

export function FolderSettingsProvider({
  isAdmin,
  reloadKey = 0,
  children,
}: {
  isAdmin: boolean;
  /** Change this number to reload the folders (the page does this after a Drive sync). */
  reloadKey?: number;
  children: ReactNode;
}) {
  const [folders, setFolders] = useState<Folder[]>([]);

  const load = useCallback(async () => {
    try {
      setFolders(await getFolders());
    } catch (e) {
      // Without the folders table the page still works: folders come from file paths.
      console.error("Failed to load folders", e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const map = useMemo<FolderMap>(() => buildFolderMap(folders), [folders]);
  const lookup = useMemo(() => ({ map, pathIndex: buildPathIndex(map) }), [map]);

  // Cache per (folder id, path), cleared whenever the folders change.
  const chainCache = useMemo(() => new Map<string, ChainNode[]>(), [lookup]);
  const chainFor = useCallback(
    (item: FolderRef): ChainNode[] => {
      const k = `${item.folder_drive_id ?? ""}\u0001${item.folder_path ?? ""}`;
      let chain = chainCache.get(k);
      if (!chain) {
        chain = resolveChain(lookup, item);
        chainCache.set(k, chain);
      }
      return chain;
    },
    [lookup, chainCache],
  );

  const applyLocal = useCallback((rows: FolderEdit[]) => {
    const byId = new Map(rows.map((r) => [r.drive_id, r]));
    setFolders((cur) =>
      cur.map((f) => {
        const edit = byId.get(f.drive_id);
        if (!edit) return f;
        const { drive_id: _id, ...patch } = edit;
        return { ...f, ...patch };
      }),
    );
  }, []);

  // Optimistic: the change shows on screen immediately, then it is saved.
  // If saving fails, reload the real data from the database.
  const saveEdits = useCallback(
    async (rows: FolderEdit[], errorMessage: string) => {
      // Virtual folders (known only from file paths) have no row to save into.
      const real = rows.filter((r) => !isVirtualKey(r.drive_id));
      if (real.length === 0) return;
      applyLocal(real);
      try {
        await saveFolderEdits(real);
      } catch (e) {
        console.error(errorMessage, e);
        alert(errorMessage);
        await load();
      }
    },
    [applyLocal, load],
  );

  const reorder = useCallback(
    async (orderedKeys: string[]) => {
      const rows = orderedKeys.map((k, i) => ({ drive_id: k, sort_order: i }));
      await saveEdits(rows, "Could not save the new folder order. Please try again.");
    },
    [saveEdits],
  );

  const rename = useCallback(
    async (key: string, newName: string, originalName: string) => {
      const trimmed = newName.trim();
      const custom = trimmed && trimmed !== originalName ? trimmed : null;
      await saveEdits([{ drive_id: key, custom_name: custom }], "Could not rename the folder. Please try again.");
    },
    [saveEdits],
  );

  const setHidden = useCallback(
    async (key: string, hidden: boolean) => {
      await saveEdits([{ drive_id: key, hidden }], "Could not update the folder. Please try again.");
    },
    [saveEdits],
  );

  const canMoveTo = useCallback(
    (key: string, targetKey: string) => canMoveFolder(map, key, targetKey),
    [map],
  );

  const moveTo = useCallback(
    async (key: string, targetKey: string) => {
      if (!canMoveFolder(map, key, targetKey)) return;
      // Moving back into its own Drive parent just clears the move.
      const backHome = map.get(key)?.parent_drive_id === targetKey;
      await saveEdits(
        [{ drive_id: key, parent_override: backHome ? null : targetKey, sort_order: null }],
        "Could not move the folder. Please try again.",
      );
    },
    [map, saveEdits],
  );

  const resetMove = useCallback(
    async (key: string) => {
      await saveEdits([{ drive_id: key, parent_override: null }], "Could not undo the move. Please try again.");
    },
    [saveEdits],
  );

  const api = useMemo<FolderSettingsApi>(
    () => ({
      chainFor,
      displayName: (key, fallback) => getDisplayName(map, key, fallback),
      isHiddenForViewer: (item) => !isAdmin && isChainHidden(map, chainFor(item)),
      isFolderHidden: (key) => map.get(key)?.hidden === true,
      sortFolders: (nodes) => sortFolders(map, nodes),
      reorder,
      rename,
      setHidden,
      isMoved: (key) => !!map.get(key)?.parent_override,
      canMoveTo,
      moveTo,
      resetMove,
    }),
    [map, isAdmin, chainFor, reorder, rename, setHidden, canMoveTo, moveTo, resetMove],
  );

  return <FolderSettingsContext.Provider value={api}>{children}</FolderSettingsContext.Provider>;
}
