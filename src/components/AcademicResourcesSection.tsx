import { useState, useEffect } from 'react';
import { FileText, BookOpen, Video, Link as LinkIcon, ExternalLink, Plus, Settings, Pencil, Trash2, FolderOpen, RefreshCcw, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { getResourceCategories } from '../lib/dataService';
import type { ResourceCategory } from '../lib/types';
import * as googleDrive from '../lib/googleDriveService';

interface AcademicResourcesSectionProps {
  isAdmin?: boolean;
}

// Icon mapping for dynamic icon loading
const iconMap: Record<string, any> = {
  BookOpen,
  FileText,
  Video,
  LinkIcon,
};

export function AcademicResourcesSection({ isAdmin = false }: AcademicResourcesSectionProps) {
  const [resourceCategories, setResourceCategories] = useState<ResourceCategory[]>([]);
  const [driveFiles, setDriveFiles] = useState<googleDrive.DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [driveSearchQuery, setDriveSearchQuery] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getResourceCategories();
        setResourceCategories(data);
        
        // Load Google Drive files if token is available
        if (googleDrive.getAccessToken()) {
          fetchDriveFiles();
        }
      } catch (error) {
        console.error('Error loading resource categories:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const fetchDriveFiles = async () => {
    try {
      setIsLoadingDrive(true);
      setDriveError(null);
      const files = await googleDrive.listDriveFiles();
      setDriveFiles(files);
    } catch (error: any) {
      console.error('Error loading Drive files:', error);
      setDriveError(error.message || 'Failed to load files from Google Drive');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // Filter drive files based on search query and limit to 50 for performance
  const filteredDriveFiles = driveFiles
    .filter(file => file.name.toLowerCase().includes(driveSearchQuery.toLowerCase()))
    .slice(0, 50);

  const handleAddResource = () => {
    console.log('Add new resource');
  };

  const handleManageResources = () => {
    console.log('Manage resources');
  };

  const handleEditCategory = (categoryId: string) => {
    console.log('Edit category:', categoryId);
  };

  const handleDeleteCategory = (categoryId: string) => {
    console.log('Delete category:', categoryId);
  };

  return (
    <div className="pb-20 lg:pb-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h1 className="text-slate-900 text-[24px] font-bold">Academic Resources</h1>
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
                onClick={handleManageResources}
                className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Resources
              </Button>
            </div>
          )}
        </div>
        <p className="text-slate-600 text-sm sm:text-base">Official materials and recommended resources for your studies</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-slate-600">Loading...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Google Drive Resources Card */}
            {googleDrive.getAccessToken() && (
              <Card className="hover:shadow-lg transition-shadow border-[#E5007D]/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#4285F4]/10 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#4285F4]" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchDriveFiles}
                      disabled={isLoadingDrive}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCcw className={`w-4 h-4 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <CardTitle className="text-base sm:text-lg">Google Drive Resources</CardTitle>
                  <CardDescription className="text-sm">Private files from the docchula shared folder</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search files..."
                      className="pl-9 h-9 text-sm"
                      value={driveSearchQuery}
                      onChange={(e) => setDriveSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {isLoadingDrive ? (
                    <div className="space-y-2 mb-4 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 bg-slate-100 rounded-lg w-full" />
                      ))}
                    </div>
                  ) : driveError ? (
                    <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg mb-4">
                      {driveError}
                    </div>
                  ) : filteredDriveFiles.length > 0 ? (
                    <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {filteredDriveFiles.map((file) => (
                        <a
                          key={file.id}
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
                        >
                          <div className="flex items-center gap-2 truncate flex-1">
                            <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="text-xs sm:text-sm text-slate-700 truncate">{file.name}</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-[#E5007D] shrink-0" />
                        </a>
                      ))}
                      {driveFiles.length > 50 && !driveSearchQuery && (
                        <div className="text-[10px] text-center text-slate-400 mt-2">
                          Showing first 50 of {driveFiles.length} files. Use search to find more.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs italic">
                      {driveSearchQuery ? 'No files match your search.' : 'No files found in this folder.'}
                    </div>
                  )}
                  <Button variant="outline" className="w-full border-[#4285F4] text-[#4285F4] hover:bg-[#4285F4]/5" size="sm" asChild>
                    <a href={`https://drive.google.com/drive/folders/${import.meta.env.VITE_GDRIVE_FOLDER_ID}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                      Open in Google Drive
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {resourceCategories.map((category) => {
              const Icon = iconMap[category.icon] || BookOpen;
              
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5007D]" />
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category.id)}
                            className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50 h-8 w-8 p-0"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
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
                          <span className="text-xs text-slate-500 shrink-0">{item.type}</span>
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
          <div className="mt-6 sm:mt-8 bg-pink-50 border border-pink-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E5007D] rounded-lg flex items-center justify-center shrink-0">
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
        </>
      )}
    </div>
  );
}