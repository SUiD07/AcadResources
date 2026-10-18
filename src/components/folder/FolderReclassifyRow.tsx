import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";
import { useFolderReclassify } from "./FolderReclassifyContext";
import {
  ANY,
  KEEP,
  NONE,
  previewReclassify,
  runReclassify,
  toFilter,
  toPatch,
} from "../../lib/FolderReclassify";
import type { FieldSet, ReclassifyPreview } from "../../lib/FolderReclassify";

type Phase = "idle" | "confirm" | "running" | "done" | "error";

const selectCls =
  "w-full text-sm border border-slate-300 rounded-md px-2 py-1.5 bg-white text-slate-900 disabled:opacity-50";

function Field({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="block text-[11px] font-medium text-slate-500 mb-0.5">{label}</span>
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={selectCls}>
        {children}
      </select>
    </label>
  );
}

/**
 * Inline "change all files in this folder" row (no popup).
 * Only files in the folder + subfolders that match FROM are changed.
 */
export function FolderReclassifyRow({
  folderPath,
  defaultFromDocType,
  defaultFromBlock,
  visibleCount,
  onClose,
}: {
  folderPath: string;
  defaultFromDocType?: string;
  /** The block this folder is shown under (so the change stays inside it). */
  defaultFromBlock?: string;
  /** How many files this folder shows on screen right now. */
  visibleCount: number;
  onClose: () => void;
}) {
  const ctx = useFolderReclassify();
  const { options } = ctx;

  const [from, setFrom] = useState<FieldSet>({
    docType: defaultFromDocType && options.docTypes.includes(defaultFromDocType) ? defaultFromDocType : ANY,
    boardExam: ANY,
    block: defaultFromBlock || ANY,
  });
  const [to, setTo] = useState<FieldSet>({ docType: KEEP, boardExam: KEEP, block: KEEP });
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [message, setMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [preview, setPreview] = useState<ReclassifyPreview & { loading: boolean; error: string | null }>({
    count: 0,
    samples: [],
    loading: true,
    error: null,
  });

  const running = phase === "running";
  const patch = toPatch(to);

  // Live preview of how many files match FROM.
  useEffect(() => {
    if (running) return;
    let cancelled = false;
    setPreview((p) => ({ ...p, loading: true, error: null }));
    const t = setTimeout(async () => {
      try {
        const r = await previewReclassify(folderPath, toFilter(from));
        if (!cancelled) setPreview({ ...r, loading: false, error: null });
      } catch (e) {
        if (!cancelled)
          setPreview({
            count: 0,
            samples: [],
            loading: false,
            error: e instanceof Error ? e.message : "Could not count files",
          });
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [folderPath, from, refreshKey, running]);

  const editFrom = (patchFrom: Partial<FieldSet>) => {
    setFrom((f) => ({ ...f, ...patchFrom }));
    setPhase("idle");
    setMessage(null);
  };
  const editTo = (patchTo: Partial<FieldSet>) => {
    setTo((t) => ({ ...t, ...patchTo }));
    setPhase("idle");
    setMessage(null);
  };

  const otherBusy = ctx.busyPath !== null && !running;
  const canApply = !!patch && preview.count > 0 && !preview.loading && !ctx.syncing && !otherBusy;

  const start = async () => {
    if (!patch) return;
    setPhase("running");
    setMessage(null);
    setProgress({ done: 0, total: preview.count });
    ctx.setBusyPath(folderPath);

    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);

    try {
      const res = await runReclassify(folderPath, toFilter(from), patch, (done, total) =>
        setProgress({ done, total }),
      );
      if (res.error) {
        setPhase("error");
        const msg = `Updated ${res.updated} of ${res.total} files, then stopped: ${res.error}`;
        setMessage(msg);
        ctx.notify(msg, true);
      } else {
        setPhase("done");
        const msg = `Updated ${res.updated} files in this folder.`;
        setMessage(msg);
        ctx.notify(msg, false);
      }
      if (res.updated > 0) await ctx.onChanged();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Reclassify failed";
      setPhase("error");
      setMessage(msg);
      ctx.notify(`Reclassify failed: ${msg}`, true);
    } finally {
      window.removeEventListener("beforeunload", warn);
      ctx.setBusyPath(null);
      setRefreshKey((k) => k + 1);
    }
  };

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div
      className="border-t border-slate-200 bg-slate-50 px-3 py-3 space-y-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700">
          Change files in this folder (and subfolders)
        </p>
        <button
          type="button"
          aria-label="Close"
          disabled={running}
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">From (only files that match)</p>
          <Field label="Type" value={from.docType} onChange={(v) => editFrom({ docType: v })} disabled={running}>
            <option value={ANY}>Any type</option>
            {options.docTypes.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Field>
          <Field label="Board exam" value={from.boardExam} onChange={(v) => editFrom({ boardExam: v })} disabled={running}>
            <option value={ANY}>Any</option>
            <option value={NONE}>(none)</option>
            {options.boardExams.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Field>
          <Field label="Block" value={from.block} onChange={(v) => editFrom({ block: v })} disabled={running}>
            <option value={ANY}>Any block</option>
            {(defaultFromBlock && !options.blocks.includes(defaultFromBlock)
              ? [defaultFromBlock, ...options.blocks]
              : options.blocks
            ).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Field>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">To</p>
          <Field label="Type" value={to.docType} onChange={(v) => editTo({ docType: v })} disabled={running}>
            <option value={KEEP}>Keep as is</option>
            {options.docTypes.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Field>
          <Field label="Board exam" value={to.boardExam} onChange={(v) => editTo({ boardExam: v })} disabled={running}>
            <option value={KEEP}>Keep as is</option>
            <option value={NONE}>(clear)</option>
            {options.boardExams.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Field>
          <Field label="Block" value={to.block} onChange={(v) => editTo({ block: v })} disabled={running}>
            <option value={KEEP}>Keep as is</option>
            {options.blocks.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Field>
        </div>
      </div>

      {/* Preview */}
      {!running && (
        <div className="text-xs text-slate-600">
          {preview.loading ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Counting files…
            </span>
          ) : preview.error ? (
            <span className="text-red-600">
              {preview.error} — did you run supabase/phase1_reclassify.sql?
            </span>
          ) : preview.count === 0 ? (
            <span>No files match “From”.</span>
          ) : (
            <div className="space-y-1">
              <p className="font-medium text-slate-800">
                This will change {preview.count.toLocaleString()} file{preview.count === 1 ? "" : "s"}.
              </p>
              {preview.count > visibleCount && (
                <p className="text-amber-700">
                  This folder shows {visibleCount.toLocaleString()} file{visibleCount === 1 ? "" : "s"} here, but{" "}
                  {preview.count.toLocaleString()} match in the whole Drive folder (other blocks too). Set
                  “From → Block” to limit the change to one block.
                </p>
              )}
              <ul className="list-disc pl-4 text-slate-500">
                {preview.samples.map((s, i) => (
                  <li key={i} className="truncate">{s}</li>
                ))}
                {preview.count > preview.samples.length && <li>…and more</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Progress */}
      {running && (
        <div className="space-y-1.5" role="status" aria-live="polite">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Updating {progress.done.toLocaleString()} / {progress.total.toLocaleString()} files… keep this page open.
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Result */}
      {phase === "done" && message && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-700" role="status">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </p>
      )}
      {phase === "error" && message && (
        <p className="flex items-start gap-1.5 text-xs text-red-600" role="alert">
          <AlertTriangle className="w-4 h-4 shrink-0" /> <span>{message}</span>
        </p>
      )}

      {ctx.syncing && (
        <p className="text-xs text-amber-700">A Drive sync is running. Wait until it finishes.</p>
      )}
      {otherBusy && (
        <p className="text-xs text-amber-700">Another folder is being updated. Wait until it finishes.</p>
      )}

      {/* Actions */}
      {!running && (
        <div className="flex flex-wrap items-center gap-2">
          {phase === "confirm" ? (
            <>
              <span className="text-xs font-medium text-slate-800">
                Change {preview.count.toLocaleString()} files?
              </span>
              <button
                type="button"
                onClick={start}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#E5007D] hover:bg-[#c00069]"
              >
                Yes, change them
              </button>
              <button
                type="button"
                onClick={() => setPhase("idle")}
                className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={!canApply}
                onClick={() => setPhase("confirm")}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#E5007D] hover:bg-[#c00069] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {phase === "error" ? "Retry" : "Apply"}
              </button>
              {!patch && <span className="text-xs text-slate-500">Choose what to change under “To”.</span>}
            </>
          )}
        </div>
      )}
    </div>
  );
}