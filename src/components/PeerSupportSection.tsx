import { useState, useMemo } from 'react';
import { FilterBar } from './FilterBar';
import { ContentCategory } from './ContentCategory';
import { mockPeerSupportData } from '../data/mockData';

export function PeerSupportSection() {
  const [selectedGeneration, setSelectedGeneration] = useState<string>('ทั้งหมด');
  const [selectedBlock, setSelectedBlock] = useState<string>('ทั้งหมด');

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return mockPeerSupportData.filter((item) => {
      const generationMatch = selectedGeneration === 'ทั้งหมด' || item.generation === selectedGeneration;
      const blockMatch = selectedBlock === 'ทั้งหมด' || item.block === selectedBlock;
      return generationMatch && blockMatch;
    });
  }, [selectedGeneration, selectedBlock]);

  // Group by category
  const groupedByCategory = useMemo(() => {
    const categories = ['AC', 'Peer Tutoring', 'Summary', 'Mock Exam', 'Resources', 'Survival Guide'];
    return categories.map((category) => ({
      name: category,
      items: filteredData.filter((item) => item.category === category),
    }));
  }, [filteredData]);

  return (
    <div className="pb-20 lg:pb-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-slate-900 mb-2 font-bold text-[24px]">Peer Support Resources</h1>
        <p className="text-slate-600 text-sm sm:text-base">Browse and access peer-created academic materials</p>
      </div>

      <FilterBar
        selectedGeneration={selectedGeneration}
        selectedBlock={selectedBlock}
        onGenerationChange={setSelectedGeneration}
        onBlockChange={setSelectedBlock}
      />

      <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
        {groupedByCategory.map((category) => (
          <ContentCategory
            key={category.name}
            categoryName={category.name}
            items={category.items}
          />
        ))}
      </div>
    </div>
  );
}