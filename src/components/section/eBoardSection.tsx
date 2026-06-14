import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Pin,
  ChevronDown,
  Users,
  FileText,
  Megaphone,
  ChevronUp,
  Palette,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "../ui/button";
import { AddAnnouncementDialog } from '../admin/AddAnnouncementDialog';
import { EditAnnouncementDialog } from '../admin/EditAnnouncementDialog';
import { DeleteAnnouncementDialog } from '../admin/DeleteAnnouncementDialog';
import { EditGenerationIdentityDialog } from "../admin/EditGenerationIdentityDialog";

export interface Announcement {
  id: string;
  generation: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  isPinned: boolean;
}

export interface GenerationMeta {
  label: string;
  year: string;
  accentHex: string;
  emoji: string;
  tagline: string;
}

const DEFAULT_META: Record<string, GenerationMeta> = {
  "MDCU 81": {
    label: "MDCU 81",
    year: "Class of 2031",
    accentHex: "#E5007D",
    emoji: "🌟",
    tagline: "The rising stars of medicine",
  },
  "MDCU 80": {
    label: "MDCU 80",
    year: "Class of 2030",
    accentHex: "#7c3aed",
    emoji: "⚡",
    tagline: "Bold minds, bright futures",
  },
  "MDCU 79": {
    label: "MDCU 79",
    year: "Class of 2029",
    accentHex: "#0284c7",
    emoji: "🔬",
    tagline: "Curious, driven, unstoppable",
  },
  "MDCU 78": {
    label: "MDCU 78",
    year: "Class of 2028",
    accentHex: "#059669",
    emoji: "🌿",
    tagline: "Healing the world, one step at a time",
  },
  "MDCU 77": {
    label: "MDCU 77",
    year: "Class of 2027",
    accentHex: "#d97706",
    emoji: "🏆",
    tagline: "Excellence in every block",
  },
  "MDCU 76": {
    label: "MDCU 76",
    year: "Class of 2026",
    accentHex: "#e11d48",
    emoji: "🎓",
    tagline: "Almost there — the final stretch",
  },
};

const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    generation: "MDCU 81",
    title: "Welcome to Block 1!",
    content:
      "<h2>Welcome Everyone!</h2><p>This is your first announcement. Good luck with your studies!</p><ul><li>Orientation: Monday 9AM</li><li>First class: Tuesday 10AM</li></ul>",
    author: "Admin MDCU 81",
    createdAt: new Date("2026-06-01"),
    isPinned: true,
  },
  {
    id: "2",
    generation: "MDCU 81",
    title: "Midterm Schedule Released",
    content:
      "<p>The midterm exam schedule has been posted. Please check the academic calendar.</p><p><strong>Important dates:</strong></p><ul><li>Written exam: June 15</li><li>Practical exam: June 17</li></ul>",
    author: "Admin MDCU 81",
    createdAt: new Date("2026-06-05"),
    isPinned: false,
  },
  {
    id: "3",
    generation: "MDCU 80",
    title: "Study Group Formation",
    content:
      "<p>We are organizing study groups for the upcoming exams. If you are interested, please sign up using the form below.</p>",
    author: "Admin MDCU 80",
    createdAt: new Date("2026-06-03"),
    isPinned: false,
  },
  {
    id: "4",
    generation: "MDCU 80",
    title: "Block 3 Resources Available",
    content:
      "<p>All Block 3 resources have been uploaded to the shared drive. Check the Academic Resources section for updated files.</p>",
    author: "Admin MDCU 80",
    createdAt: new Date("2026-06-08"),
    isPinned: true,
  },
  {
    id: "5",
    generation: "MDCU 79",
    title: "Clinical Rotation Schedule",
    content:
      "<p>The updated clinical rotation schedule for the next semester is now available. Please review your assigned rotations carefully.</p><ul><li>Group A: Internal Medicine</li><li>Group B: Surgery</li><li>Group C: Pediatrics</li></ul>",
    author: "Admin MDCU 79",
    createdAt: new Date("2026-06-07"),
    isPinned: false,
  },
  {
    id: "6",
    generation: "MDCU 78",
    title: "Final Exam Preparation Tips",
    content:
      "<p>As finals approach, here are some key resources to help you prepare. The tutor schedule has been updated in the Peer Support section.</p>",
    author: "Admin MDCU 78",
    createdAt: new Date("2026-06-06"),
    isPinned: false,
  },
];

interface BoardSectionProps {
  isAdmin: boolean;
}

export function BoardSection({ isAdmin }: BoardSectionProps) {
  const [announcements] = useState<Announcement[]>(mockAnnouncements);
  const [selectedGeneration, setSelectedGeneration] =
    useState<string>("MDCU 81");
  const [genMeta, setGenMeta] =
    useState<Record<string, GenerationMeta>>(DEFAULT_META);
  const [bannerExpanded, setBannerExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] =
    useState<Announcement | null>(null);
  const [editingIdentity, setEditingIdentity] = useState<GenerationMeta | null>(
    null,
  );

  const generations = [
    "MDCU 81",
    "MDCU 80",
    "MDCU 79",
    "MDCU 78",
    "MDCU 77",
    "MDCU 76",
  ];
  const meta = genMeta[selectedGeneration];
  const filteredAnnouncements = announcements.filter(
    (a) => a.generation === selectedGeneration,
  );
  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter((a) => !a.isPinned);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleTabChange(gen: string) {
    setSelectedGeneration(gen);
    setBannerExpanded(false);
  }

  function handleSaveIdentity(updated: GenerationMeta) {
    setGenMeta((prev) => ({ ...prev, [updated.label]: updated }));
    setEditingIdentity(null);
  }

  const sharedProps = {
    announcements,
    generations,
    genMeta,
    selectedGeneration,
    meta,
    filteredAnnouncements,
    pinnedAnnouncements,
    regularAnnouncements,
    bannerExpanded,
    fullscreen,
    isAdmin,
    isAddDialogOpen,
    onTabChange: handleTabChange,
    onBannerToggle: () => setBannerExpanded((p) => !p),
    onFullscreenToggle: () => setFullscreen((p) => !p),
    onAddOpen: () => setIsAddDialogOpen(true),
    onAddOpenChange: setIsAddDialogOpen,
    onEditAnnouncement: setEditingAnnouncement,
    onDeleteAnnouncement: setDeletingAnnouncement,
    onEditIdentity: setEditingIdentity,
  };

  return (
    <>
      {!fullscreen && (
        <div className="space-y-0">
          <BoardInner {...sharedProps} />
        </div>
      )}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-slate-100 flex flex-col"
          style={{ fontFamily: "inherit" }}
        >
          <BoardInner {...sharedProps} />
        </div>
      )}

      <AddAnnouncementDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      {editingAnnouncement && (
        <EditAnnouncementDialog
          open={!!editingAnnouncement}
          onOpenChange={(open) => {
            if (!open) setEditingAnnouncement(null);
          }}
          announcement={editingAnnouncement}
        />
      )}
      {deletingAnnouncement && (
        <DeleteAnnouncementDialog
          open={!!deletingAnnouncement}
          onOpenChange={(open) => {
            if (!open) setDeletingAnnouncement(null);
          }}
          announcement={deletingAnnouncement}
        />
      )}
      {editingIdentity && (
        <EditGenerationIdentityDialog
          open={!!editingIdentity}
          onOpenChange={(open) => {
            if (!open) setEditingIdentity(null);
          }}
          meta={editingIdentity}
          onSave={handleSaveIdentity}
        />
      )}
    </>
  );
}

/* ── Inner board layout (extracted so it's valid JSX in a real component) ── */

interface BoardInnerProps {
  announcements: Announcement[];
  generations: string[];
  genMeta: Record<string, GenerationMeta>;
  selectedGeneration: string;
  meta: GenerationMeta;
  filteredAnnouncements: Announcement[];
  pinnedAnnouncements: Announcement[];
  regularAnnouncements: Announcement[];
  bannerExpanded: boolean;
  fullscreen: boolean;
  isAdmin: boolean;
  isAddDialogOpen: boolean;
  onTabChange: (gen: string) => void;
  onBannerToggle: () => void;
  onFullscreenToggle: () => void;
  onAddOpen: () => void;
  onAddOpenChange: (open: boolean) => void;
  onEditAnnouncement: (a: Announcement) => void;
  onDeleteAnnouncement: (a: Announcement) => void;
  onEditIdentity: (m: GenerationMeta) => void;
}

function BoardInner({
  announcements,
  generations,
  genMeta,
  selectedGeneration,
  meta,
  filteredAnnouncements,
  pinnedAnnouncements,
  regularAnnouncements,
  bannerExpanded,
  fullscreen,
  isAdmin,
  onTabChange,
  onBannerToggle,
  onFullscreenToggle,
  onAddOpen,
  onEditAnnouncement,
  onDeleteAnnouncement,
  onEditIdentity,
}: BoardInnerProps) {
  return (
    <div className={`flex flex-col ${fullscreen ? "h-full" : ""}`}>
      {/* Header */}
      <div
        className={`flex items-start justify-between mb-4 ${fullscreen ? "px-6 pt-6" : ""}`}
      >
        <div>
          <h1 className="text-slate-900">Announcements Board</h1>
          <p className="text-slate-500 mt-1">
            Select your generation to see announcements
          </p>
        </div>
        <button
          onClick={onFullscreenToggle}
          title={fullscreen ? "Exit fullscreen" : "Expand to fullscreen"}
          className="ml-4 flex-shrink-0 p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
        >
          {fullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Tab Strip */}
      <div
        className={`border-b border-slate-200 bg-white sticky top-0 z-10 ${fullscreen ? "px-6" : ""}`}
      >
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          {generations.map((gen) => {
            const m = genMeta[gen];
            const count = announcements.filter(
              (a) => a.generation === gen,
            ).length;
            const active = selectedGeneration === gen;
            return (
              <button
                key={gen}
                onClick={() => onTabChange(gen)}
                style={
                  active
                    ? { borderBottomColor: m.accentHex, color: m.accentHex }
                    : {}
                }
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                  active
                    ? "border-current"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <span>{m.emoji}</span>
                {gen}
                {count > 0 && (
                  <span
                    className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs"
                    style={
                      active
                        ? { backgroundColor: m.accentHex, color: "#fff" }
                        : { backgroundColor: "#f1f5f9", color: "#64748b" }
                    }
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable body */}
      <div className={fullscreen ? "flex-1 overflow-y-auto px-6 pb-6" : ""}>
        {/* Hero Banner */}
        <div
          className="relative overflow-hidden rounded-b-2xl mb-6 cursor-pointer select-none"
          style={{
            background: `linear-gradient(135deg, ${meta.accentHex} 0%, ${meta.accentHex}bb 100%)`,
          }}
          onClick={onBannerToggle}
        >
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute top-4 right-24 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />

          {!bannerExpanded && (
            <div className="relative px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <span className="text-2xl">{meta.emoji}</span>
                <div>
                  <span className="font-bold text-lg">{meta.label}</span>
                  <span className="ml-2 text-white/70 text-sm">
                    {meta.year}
                  </span>
                </div>
                <span className="hidden sm:block text-white/60 text-sm italic ml-2">
                  — {meta.tagline}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <span className="text-xs hidden sm:block">Click to expand</span>
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          )}

          {bannerExpanded && (
            <div className="relative px-6 py-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-5xl">{meta.emoji}</span>
                    <div>
                      <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                        {meta.year}
                      </p>
                      <h2
                        className="text-white font-bold"
                        style={{ fontSize: "2rem", lineHeight: 1.2 }}
                      >
                        {meta.label}
                      </h2>
                    </div>
                  </div>
                  <p className="text-white/80 italic mt-2 text-sm">
                    {meta.tagline}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex gap-3">
                    <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 text-center text-white min-w-[70px]">
                      <FileText className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xl font-bold">
                        {filteredAnnouncements.length}
                      </div>
                      <div className="text-xs text-white/80">Posts</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3 text-center text-white min-w-[70px]">
                      <Pin className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xl font-bold">
                        {pinnedAnnouncements.length}
                      </div>
                      <div className="text-xs text-white/80">Pinned</div>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditIdentity(meta);
                      }}
                      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors backdrop-blur"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      Edit Identity
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center mt-6 text-white/70">
                <ChevronUp className="w-5 h-5" />
                <span className="text-xs ml-1">Click to collapse</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div
            className="flex items-center gap-2"
            style={{ color: meta.accentHex }}
          >
            <Megaphone className="w-4 h-4" />
            <span className="text-sm font-medium">
              {filteredAnnouncements.length === 0
                ? "No announcements yet"
                : `${filteredAnnouncements.length} announcement${filteredAnnouncements.length > 1 ? "s" : ""}`}
            </span>
          </div>
          {isAdmin && (
            <Button
              onClick={onAddOpen}
              className="text-white"
              style={{ backgroundColor: meta.accentHex }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          )}
        </div>

        {/* Pinned */}
        {pinnedAnnouncements.length > 0 && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 px-1">
              <Pin className="w-4 h-4" style={{ color: meta.accentHex }} />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Pinned
              </span>
            </div>
            {pinnedAnnouncements.map((a) => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                meta={meta}
                isAdmin={isAdmin}
                onEdit={onEditAnnouncement}
                onDelete={onDeleteAnnouncement}
              />
            ))}
          </div>
        )}

        {/* Regular */}
        {regularAnnouncements.length > 0 && (
          <div className="space-y-3 mb-4">
            {pinnedAnnouncements.length > 0 && (
              <div className="flex items-center gap-2 px-1">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  All Posts
                </span>
              </div>
            )}
            {regularAnnouncements.map((a) => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                meta={meta}
                isAdmin={isAdmin}
                onEdit={onEditAnnouncement}
                onDelete={onDeleteAnnouncement}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {filteredAnnouncements.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <span className="text-5xl block mb-4">{meta.emoji}</span>
            <p className="text-slate-500 text-sm">
              No announcements yet for {selectedGeneration}.
            </p>
            {isAdmin && (
              <Button
                className="mt-4 text-white"
                style={{ backgroundColor: meta.accentHex }}
                onClick={onAddOpen}
              >
                <Plus className="w-4 h-4 mr-2" /> Post First Announcement
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Announcement Card ── */

interface AnnouncementCardProps {
  announcement: Announcement;
  meta: GenerationMeta;
  isAdmin: boolean;
  onEdit: (a: Announcement) => void;
  onDelete: (a: Announcement) => void;
}

const COLLAPSE_HEIGHT = 120;

function AnnouncementCard({
  announcement,
  meta,
  isAdmin,
  onEdit,
  onDelete,
}: AnnouncementCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current)
      setNeedsExpand(contentRef.current.scrollHeight > COLLAPSE_HEIGHT);
  }, [announcement.content]);

  return (
    <div
      className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      style={{
        borderColor: announcement.isPinned ? meta.accentHex : "#e2e8f0",
      }}
    >
      {announcement.isPinned && (
        <div className="h-1" style={{ backgroundColor: meta.accentHex }} />
      )}

      <div
        className="px-5 py-4 flex items-start justify-between border-b"
        style={{
          backgroundColor: announcement.isPinned
            ? `${meta.accentHex}0d`
            : "#f8fafc",
          borderColor: announcement.isPinned
            ? `${meta.accentHex}33`
            : "#e2e8f0",
        }}
      >
        <div className="flex-1 min-w-0">
          {announcement.isPinned && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white mb-1.5"
              style={{ backgroundColor: meta.accentHex }}
            >
              <Pin className="w-3 h-3" /> Pinned
            </span>
          )}
          <h3 className="text-slate-900 leading-snug">{announcement.title}</h3>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {announcement.createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {announcement.author}
            </span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1 ml-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(announcement)}
              className="text-slate-400 hover:text-slate-700 h-8 w-8 p-0"
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(announcement)}
              className="text-slate-400 hover:text-red-500 h-8 w-8 p-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <div
          style={{
            maxHeight: expanded || !needsExpand ? undefined : COLLAPSE_HEIGHT,
            overflow: "hidden",
            transition: "max-height 0.35s ease",
          }}
        >
          <div
            ref={contentRef}
            className="px-5 py-4 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: announcement.content }}
          />
        </div>
        {needsExpand && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
        {needsExpand && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-t border-slate-100 transition-colors"
            style={{ color: meta.accentHex }}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            />
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
}
