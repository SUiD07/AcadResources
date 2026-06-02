import { useState, useMemo, useEffect } from 'react';
import { FilterBar } from './FilterBar';
import { ContentCategory } from './ContentCategory';
import { getStudentDocuments } from '../lib/dataService';
import type { StudentDocument, PeerSupportItem } from '../lib/types';
import * as googleDrive from '../lib/googleDriveService';
import { detectDocType, detectBlock } from './categorize';
import { Button } from './ui/button';
import { Plus, Search, RefreshCcw } from 'lucide-react';

interface PeerSupportSectionProps {
  isAdmin?: boolean;
}

export function PeerSupportSection({ isAdmin = false }: PeerSupportSectionProps) {
  const [selectedGeneration, setSelectedGeneration] = useState<string>('ทั้งหมด');
  const [selectedBlock, setSelectedBlock] = useState<string>('ทั้งหมด');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  
  const [studentDocs, setStudentDocs] = useState<StudentDocument[]>([]);
  const [driveFiles, setDriveFiles] = useState<googleDrive.DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // Fetch DB data
        const data = await getStudentDocuments();
        setStudentDocs(data);
        
        // Fetch Drive data
        if (googleDrive.getAccessToken()) {
          fetchDriveFiles();
        }
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const fetchDriveFiles = async () => {
    try {
      setIsLoadingDrive(true);
      const files = await googleDrive.listDriveFiles();
      setDriveFiles(files);
    } catch (error) {
      console.error('Error loading Drive files:', error);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // Process and Filter Data
  const groupedByCategory = useMemo(() => {
    // 1. Process Database Docs
    const mappedDb = studentDocs.map(doc => ({
      id: doc.id.toString(),
      block_name: doc.title,
      thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=100&h=100&fit=crop',
      drive_link: doc.file_url,
      generation: `MDCU ${doc.generation}`,
      block: doc.block,
      category: doc.doc_type
    })) as PeerSupportItem[];

    // 2. Process Auto-Discovered Drive Files
    const mappedDrive = driveFiles.map(file => ({
      id: file.id,
      block_name: file.name,
      thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=100&h=100&fit=crop',
      drive_link: file.webViewLink,
      generation: 'Auto-Detected',
      block: detectBlock(file.name),
      category: detectDocType(file.name)
    })) as PeerSupportItem[];

    // Combine and Filter
    const combined = [...mappedDb, ...mappedDrive].filter((item) => {
      const genMatch = selectedGeneration === 'ทั้งหมด' || item.generation.includes(selectedGeneration.replace('MDCU ', ''));
      const blockMatch = selectedBlock === 'ทั้งหมด' || item.block === selectedBlock;
      const catMatch = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
      return genMatch && blockMatch && catMatch;
    });

    const categories = [
      'AC', 'Summary', 'Peer Tutoring', 'Mock Exam', 
      'Lab & Spottest', 'NLE 1', 'NLE 2', 'Resources', 'Survival Guide'
    ];

    return categories.map((cat) => ({
      name: cat,
      items: combined.filter((item) => item.category === cat),
    })).filter(group => group.items.length > 0);
  }, [studentDocs, driveFiles, selectedGeneration, selectedBlock, selectedCategory]);

  const handleAddResource = () => {
    console.log('Add new resource');
  };

  return (
    <div className="pb-20 lg:pb-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h1 className="text-slate-900 font-bold text-[24px]">Peer Support Resources</h1>
          {isAdmin && (
            <Button size="sm" onClick={handleAddResource} className="bg-[#E5007D] hover:bg-[#c00069] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add New Resource
            </Button>
          )}
        </div>
        <p className="text-slate-600 text-sm sm:text-base">Browse and access peer-created academic materials</p>
      </div>

      <FilterBar
        selectedGeneration={selectedGeneration}
        selectedBlock={selectedBlock}
        selectedCategory={selectedCategory}
        onGenerationChange={setSelectedGeneration}
        onBlockChange={setSelectedBlock}
        onCategoryChange={setSelectedCategory}
      />

      {(isLoading || isLoadingDrive) && (
        <div className="flex justify-center items-center py-12">
          <RefreshCcw className="w-6 h-6 text-[#E5007D] animate-spin mr-2" />
          <div className="text-slate-600">Syncing data...</div>
        </div>
      )}

      <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
        {groupedByCategory.length > 0 ? (
          groupedByCategory.map((category) => (
            <ContentCategory
              key={category.name}
              categoryName={category.name}
              items={category.items}
              isAdmin={isAdmin}
            />
          ))
        ) : !isLoading && !isLoadingDrive && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-900 font-medium">No resources found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
