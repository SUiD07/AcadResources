import type { PeerSupportItem, Activity, ResourceCategory } from '../lib/types';

export const mockPeerSupportData: PeerSupportItem[] = [
  // AC Category
  {
    id: 'ac-1',
    block_name: 'Clinical Neuroscience',
    block_code: '3000384',
    thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400',
    drive_link: 'https://drive.google.com',
    generation: 'MDCU 81',
    block: 'Clinical Neuroscience',
    category: 'AC',
  },
  {
    id: 'ac-2',
    block_name: 'Cardiovascular System',
    block_code: '3000385',
    thumbnail: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=400',
    drive_link: 'https://drive.google.com',
    generation: 'MDCU 80',
    block: 'Cardiovascular System',
    category: 'AC',
  },
  {
    id: 'ac-3',
    block_name: 'Respiratory System',
    block_code: '3000386',
    thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
    drive_link: 'https://drive.google.com',
    generation: 'MDCU 81',
    block: 'Block 2.1',
    category: 'AC',
  },
  
  // Peer Tutoring Category
  {
    id: 'pt-1',
    block_name: 'Clinical Neuroscience Tutorial',
    block_code: '3000384',
    thumbnail: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
    drive_link: 'https://drive.google.com',
    generation: 'MDCU 81',
    block: 'Clinical Neuroscience',
    category: 'Peer Tutoring',
  },
  {
    id: 'pt-2',
    block_name: 'Pharmacology Study Session',
    block_code: '3000387',
    thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
    drive_link: 'https://drive.google.com',
    generation: 'MDCU 80',
    block: 'Block 1.2',
    category: 'Peer Tutoring',
  },

  // Summary Category
  {
    id: 'sum-1',
    block_name: 'Neuroscience Summary Notes',
    block_code: '3000384',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
    drive_link: 'https://drive.google.com',
    generation: 'MDCU 81',
    block: 'Clinical Neuroscience',
    category: 'Summary',
  },

  // Mock Exam Category
  {
    id: 'mock-1',
    block_name: 'Neuroscience Practice Test',
    block_code: '3000384',
    thumbnail: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400',
    drive_link: 'https://drive.google.com',
    generation: 'MDCU 81',
    block: 'Clinical Neuroscience',
    category: 'Mock Exam',
  },

  // Survival Guide Category
  {
    id: 'sg-1',
    block_name: 'How to Pass Neuroscience',
    block_code: '3000384',
    thumbnail: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=400',
    drive_link: 'https://drive.google.com',
    generation: 'MDCU 81',
    block: 'Clinical Neuroscience',
    category: 'Survival Guide',
  },
];

// Mock Activities Data
export const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Clinical Skills Workshop',
    description: 'Hands-on practice sessions',
    icon: 'Users',
    date: 'May 2, 2026',
    status: 'Completed',
  },
  {
    id: '2',
    title: 'Research Symposium',
    description: 'Annual student research presentation',
    icon: 'Award',
    date: 'December 15, 2025',
    status: 'Upcoming',
  },
  {
    id: '3',
    title: 'Journal Club',
    description: 'Monthly discussion of medical literature',
    icon: 'BookOpen',
    date: 'May 2, 2026',
    status: 'Ongoing',
  },
  {
    id: '4',
    title: 'OSCE Preparation',
    description: 'Mock OSCE stations with feedback',
    icon: 'Calendar',
    date: 'November 25, 2025',
    status: 'Registration Open',
  },
];

// Mock Resource Categories Data
export const mockResourceCategories: ResourceCategory[] = [
  {
    id: 'acd',
    title: 'ACD Resources',
    description: 'Official Academic Development Center materials and guidelines',
    icon: 'BookOpen',
    items: [
      { name: 'Study Guidelines', type: 'PDF' },
      { name: 'Curriculum Overview', type: 'PDF' },
      { name: 'Assessment Rubrics', type: 'Document' },
    ],
    link: '#',
  },
  {
    id: 'textbooks',
    title: 'Recommended Textbooks',
    description: 'Curated list of essential medical textbooks by subject',
    icon: 'FileText',
    items: [
      { name: "Robbins Basic Pathology", type: 'Reference' },
      { name: "Guyton and Hall Physiology", type: 'Reference' },
      { name: "Kumar & Clark's Medicine", type: 'Reference' },
    ],
    link: '#',
  },
  {
    id: 'videos',
    title: 'Video Lectures',
    description: 'Recorded lectures and demonstrations from faculty',
    icon: 'Video',
    items: [
      { name: 'Anatomy Demonstrations', type: 'Video Series' },
      { name: 'Clinical Skills Videos', type: 'Video Series' },
      { name: 'Pharmacology Lectures', type: 'Video Series' },
    ],
    link: '#',
  },
  {
    id: 'external',
    title: 'External Resources',
    description: 'Links to useful medical education websites and databases',
    icon: 'LinkIcon',
    items: [
      { name: 'PubMed', type: 'Database' },
      { name: 'UpToDate', type: 'Clinical Resource' },
      { name: 'Osmosis', type: 'Learning Platform' },
    ],
    link: '#',
  },
];