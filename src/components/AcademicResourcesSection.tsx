import { FileText, BookOpen, Video, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export function AcademicResourcesSection() {
  const resourceCategories = [
    {
      id: 'acd',
      title: 'ACD Resources',
      description: 'Official Academic Development Center materials and guidelines',
      icon: BookOpen,
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
      icon: FileText,
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
      icon: Video,
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
      icon: LinkIcon,
      items: [
        { name: 'PubMed', type: 'Database' },
        { name: 'UpToDate', type: 'Clinical Resource' },
        { name: 'Osmosis', type: 'Learning Platform' },
      ],
      link: '#',
    },
  ];

  return (
    <div className="pb-20 lg:pb-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-slate-900 mb-2 text-[24px] font-bold">Academic Resources</h1>
        <p className="text-slate-600 text-sm sm:text-base">Official materials and recommended resources for your studies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {resourceCategories.map((category) => {
          const Icon = category.icon;
          
          return (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <CardTitle className="text-base sm:text-lg">{category.title}</CardTitle>
                <CardDescription className="text-sm">{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {category.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg"
                    >
                      <span className="text-xs sm:text-sm text-slate-700 truncate pr-2">{item.name}</span>
                      <span className="text-xs text-slate-500 flex-shrink-0">{item.type}</span>
                    </div>
                  ))}
                </div>
                <Button variant="default" className="w-full" size="sm" asChild>
                  <a href={category.link} className="inline-flex items-center gap-2">
                    View All Resources
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ACD Resources Highlight */}
      <div className="mt-6 sm:mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-slate-900 mb-2">ACD Resources Portal</h3>
            <p className="text-slate-600 text-sm sm:text-base mb-4">
              Access comprehensive resources from the Academic Development Center including study guides, 
              curriculum documents, and official academic policies.
            </p>
            <Button variant="default" size="sm" className="w-full sm:w-auto">
              Go to ACD Resources
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}