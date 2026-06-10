import { useState, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Pin, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { AddAnnouncementDialog } from '../admin/AddAnnouncementDialog';
import { EditAnnouncementDialog } from '../admin/EditAnnouncementDialog';
import { DeleteAnnouncementDialog } from '../admin/DeleteAnnouncementDialog';
import { format } from 'date-fns';

export interface Announcement {
  id: string;
  generation: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  isPinned: boolean;
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    generation: 'MDCU 81',
    title: 'Welcome to Block 1!',
    content: '<h2>Welcome Everyone!</h2><p>This is your first announcement. Good luck with your studies!</p><ul><li>Orientation: Monday 9AM</li><li>First class: Tuesday 10AM</li></ul>',
    author: 'Admin MDCU 81',
    createdAt: new Date('2026-06-01'),
    isPinned: true,
  },
  {
    id: '2',
    generation: 'MDCU 81',
    title: 'Midterm Schedule Released',
    content: '<p>The midterm exam schedule has been posted. Please check the academic calendar.</p><p><strong>Important dates:</strong></p><ul><li>Written exam: June 15</li><li>Practical exam: June 17</li></ul>',
    author: 'Admin MDCU 81',
    createdAt: new Date('2026-06-05'),
    isPinned: false,
  },
  {
    id: '3',
    generation: 'MDCU 80',
    title: 'Study Group Formation',
    content: '<p>We are organizing study groups for the upcoming exams. If you are interested, please sign up using the form below.</p>',
    author: 'Admin MDCU 80',
    createdAt: new Date('2026-06-03'),
    isPinned: false,
  },
  {
    id: '4',
    generation: 'MDCU 80',
    title: 'Block 3 Resources Available',
    content: '<p>All Block 3 resources have been uploaded to the shared drive. Check the Academic Resources section for updated files.</p>',
    author: 'Admin MDCU 80',
    createdAt: new Date('2026-06-08'),
    isPinned: true,
  },
  {
    id: '5',
    generation: 'MDCU 79',
    title: 'Clinical Rotation Schedule',
    content: '<p>The updated clinical rotation schedule for the next semester is now available. Please review your assigned rotations carefully.</p><ul><li>Group A: Internal Medicine</li><li>Group B: Surgery</li><li>Group C: Pediatrics</li></ul>',
    author: 'Admin MDCU 79',
    createdAt: new Date('2026-06-07'),
    isPinned: false,
  },
  {
    id: '6',
    generation: 'MDCU 78',
    title: 'Final Exam Preparation Tips',
    content: '<p>As finals approach, here are some key resources to help you prepare. The tutor schedule has been updated in the Peer Support section.</p>',
    author: 'Admin MDCU 78',
    createdAt: new Date('2026-06-06'),
    isPinned: false,
  },
];

interface BoardSectionProps {
  isAdmin: boolean;
}

export function BoardSection({ isAdmin }: BoardSectionProps) {
  const [announcements] = useState<Announcement[]>(mockAnnouncements);
  const [selectedGeneration, setSelectedGeneration] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);

  const generations = ['MDCU 81', 'MDCU 80', 'MDCU 79', 'MDCU 78', 'MDCU 77', 'MDCU 76'];

  const filteredAnnouncements = selectedGeneration === 'all'
    ? announcements
    : announcements.filter(a => a.generation === selectedGeneration);

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.isPinned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-slate-900">Announcements Board</h1>
          <p className="text-slate-600 mt-1">Stay updated with important announcements from your generation</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#E5007D] hover:bg-[#C1006A] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </Button>
        )}
      </div>

      {/* Generation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          <button
            onClick={() => setSelectedGeneration('all')}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              selectedGeneration === 'all'
                ? 'border-[#E5007D] text-[#E5007D]'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            All
          </button>
          {generations.map(gen => {
            const count = announcements.filter(a => a.generation === gen).length;
            return (
              <button
                key={gen}
                onClick={() => setSelectedGeneration(gen)}
                className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  selectedGeneration === gen
                    ? 'border-[#E5007D] text-[#E5007D]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {gen}
                {count > 0 && (
                  <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs ${
                    selectedGeneration === gen ? 'bg-[#E5007D] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-slate-700 flex items-center gap-2">
            <Pin className="w-4 h-4 text-[#E5007D]" />
            Pinned Announcements
          </h2>
          {pinnedAnnouncements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isAdmin={isAdmin}
              onEdit={setEditingAnnouncement}
              onDelete={setDeletingAnnouncement}
            />
          ))}
        </div>
      )}

      {/* Regular Announcements */}
      <div className="space-y-3">
        {regularAnnouncements.length === 0 && pinnedAnnouncements.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No announcements found for this generation.</p>
          </div>
        ) : (
          regularAnnouncements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isAdmin={isAdmin}
              onEdit={setEditingAnnouncement}
              onDelete={setDeletingAnnouncement}
            />
          ))
        )}
      </div>

      {/* Dialogs */}
      <AddAnnouncementDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      {editingAnnouncement && (
        <EditAnnouncementDialog
          open={!!editingAnnouncement}
          onOpenChange={(open) => !open && setEditingAnnouncement(null)}
          announcement={editingAnnouncement}
        />
      )}
      {deletingAnnouncement && (
        <DeleteAnnouncementDialog
          open={!!deletingAnnouncement}
          onOpenChange={(open) => !open && setDeletingAnnouncement(null)}
          announcement={deletingAnnouncement}
        />
      )}
    </div>
  );
}

interface AnnouncementCardProps {
  announcement: Announcement;
  isAdmin: boolean;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
}

const COLLAPSE_HEIGHT = 120;

function AnnouncementCard({ announcement, isAdmin, onEdit, onDelete }: AnnouncementCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setNeedsExpand(contentRef.current.scrollHeight > COLLAPSE_HEIGHT);
    }
  }, [announcement.content]);

  return (
    <div className={`bg-white rounded-lg border ${announcement.isPinned ? 'border-[#E5007D]' : 'border-slate-200'} overflow-hidden`}>
      {/* Header */}
      <div className={`p-4 ${announcement.isPinned ? 'bg-pink-50' : 'bg-slate-50'} border-b ${announcement.isPinned ? 'border-[#E5007D]' : 'border-slate-200'} flex items-start justify-between`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-2 py-1 bg-[#E5007D] text-white text-xs rounded">
              {announcement.generation}
            </span>
            {announcement.isPinned && (
              <Pin className="w-4 h-4 text-[#E5007D]" />
            )}
          </div>
          <h3 className="text-slate-900">{announcement.title}</h3>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(announcement.createdAt, 'MMM dd, yyyy')}
            </span>
            <span>By {announcement.author}</span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(announcement)}
              className="text-slate-600 hover:text-[#E5007D]"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(announcement)}
              className="text-slate-600 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative">
        <div
          style={{ maxHeight: expanded || !needsExpand ? undefined : COLLAPSE_HEIGHT, overflow: 'hidden', transition: 'max-height 0.3s ease' }}
        >
          <div
            ref={contentRef}
            className="p-4 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: announcement.content }}
          />
        </div>

        {needsExpand && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent pointer-events-none" />
        )}

        {needsExpand && (
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-[#E5007D] hover:text-[#C1006A] font-medium border-t border-slate-100 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  );
}
