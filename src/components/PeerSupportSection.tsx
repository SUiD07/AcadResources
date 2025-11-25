import { useState, useMemo, useEffect } from 'react';
import { FilterBar } from './FilterBar';
import { ContentCategory } from './ContentCategory';
import { getPeerSupportData } from '../lib/dataService';
import type { PeerSupportItem } from '../lib/types';
import { Button } from './ui/button';
import { Plus, Settings, Upload, Link } from 'lucide-react';

interface PeerSupportSectionProps {
  isAdmin?: boolean;
}

export function PeerSupportSection({ isAdmin = false }: PeerSupportSectionProps) {
  const [selectedGeneration, setSelectedGeneration] = useState<string>('ทั้งหมด');
  const [selectedBlock, setSelectedBlock] = useState<string>('ทั้งหมด');
  const [peerSupportData, setPeerSupportData] = useState<PeerSupportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getPeerSupportData();
        setPeerSupportData(data);
      } catch (error) {
        console.error('Error loading peer support data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return peerSupportData.filter((item) => {
      const generationMatch = selectedGeneration === 'ทั้งหมด' || item.generation === selectedGeneration;
      const blockMatch = selectedBlock === 'ทั้งหมด' || item.block === selectedBlock;
      return generationMatch && blockMatch;
    });
  }, [peerSupportData, selectedGeneration, selectedBlock]);

  // Group by category
  const groupedByCategory = useMemo(() => {
    const categories = ['AC', 'Peer Tutoring', 'Summary', 'Mock Exam', 'Resources', 'Survival Guide'];
    return categories.map((category) => ({
      name: category,
      items: filteredData.filter((item) => item.category === category),
    }));
  }, [filteredData]);

  const handleAddResource = () => {
    console.log('Add new resource');
  };

  const handleManageBlock = () => {
    console.log('Manage block');
  };

  const handleUploadPicture = () => {
    console.log('Upload picture');
  };

  const handleUpdateLink = () => {
    console.log('Update Google Drive link');
  };

  return (
    <div className="pb-20 lg:pb-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h1 className="text-slate-900 font-bold text-[24px]">Peer Support Resources</h1>
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={handleAddResource}
                className="bg-[#E5007D] hover:bg-[#c00069] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Resource
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleManageBlock}
                className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Block
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleUploadPicture}
                className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Picture
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleUpdateLink}
                className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50"
              >
                <Link className="w-4 h-4 mr-2" />
                Update Drive Link
              </Button>
            </div>
          )}
        </div>
        <p className="text-slate-600 text-sm sm:text-base">Browse and access peer-created academic materials</p>
      </div>

      <FilterBar
        selectedGeneration={selectedGeneration}
        selectedBlock={selectedBlock}
        onGenerationChange={setSelectedGeneration}
        onBlockChange={setSelectedBlock}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-slate-600">Loading...</div>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
          {groupedByCategory.map((category) => (
            <ContentCategory
              key={category.name}
              categoryName={category.name}
              items={category.items}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}