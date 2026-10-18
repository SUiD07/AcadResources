import { createContext, useContext } from "react";

export interface ReclassifyOptions {
  docTypes: string[];
  boardExams: string[];
  blocks: string[];
}

export interface FolderReclassifyApi {
  options: ReclassifyOptions;
  /** A Drive sync is running: reclassify is disabled. */
  syncing: boolean;
  /** Path of the folder currently being reclassified (null = idle). */
  busyPath: string | null;
  setBusyPath: (path: string | null) => void;
  /** Reload documents after files were changed. */
  onChanged: () => Promise<void> | void;
  /** Show a status message in the page header (survives the folder moving category). */
  notify: (message: string, failed?: boolean) => void;
}

const DEFAULT_API: FolderReclassifyApi = {
  options: { docTypes: [], boardExams: [], blocks: [] },
  syncing: false,
  busyPath: null,
  setBusyPath: () => {},
  onChanged: () => {},
  notify: () => {},
};

export const FolderReclassifyContext = createContext<FolderReclassifyApi>(DEFAULT_API);

export function useFolderReclassify() {
  return useContext(FolderReclassifyContext);
}