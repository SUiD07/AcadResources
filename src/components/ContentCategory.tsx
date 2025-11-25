import { ExternalLink, FolderOpen, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ContentItem {
  id: string;
  blockName: string;
  blockCode?: string;
  thumbnail: string;
  driveLink: string;
  generation: string;
  block: string;
  category: string;
}

interface ContentCategoryProps {
  categoryName: string;
  items: ContentItem[];
  isAdmin?: boolean;
}

export function ContentCategory({ categoryName, items, isAdmin = false }: ContentCategoryProps) {
  if (items.length === 0) return null;

  const handleEdit = (itemId: string) => {
    console.log('Edit item:', itemId);
    // Mock edit functionality
  };

  const handleDelete = (itemId: string) => {
    console.log('Delete item:', itemId);
    // Mock delete functionality
  };

  const handleAddNew = () => {
    console.log('Add new item to category:', categoryName);
    // Mock add functionality
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-slate-900">{categoryName}</h3>
          <p className="text-sm text-slate-600">{items.length} resources available</p>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={handleAddNew}
            className="bg-[#E5007D] hover:bg-[#c00069] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-slate-600">Block Name</th>
              <th className="px-6 py-3 text-left text-xs text-slate-600">Preview</th>
              <th className="px-6 py-3 text-left text-xs text-slate-600">Generation</th>
              <th className="px-6 py-3 text-left text-xs text-slate-600">Action</th>
              {isAdmin && <th className="px-6 py-3 text-left text-xs text-slate-600">Admin</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    {item.blockCode && (
                      <div className="text-xs text-slate-500 mb-1">{item.blockCode}</div>
                    )}
                    <div className="text-slate-900">{item.blockName}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <ImageWithFallback
                    src={item.thumbnail}
                    alt={item.blockName}
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                  />
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-pink-50 text-[#E5007D]">
                    {item.generation}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={item.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Open Drive
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item.id)}
                        className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50"
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.id} className="p-4">
            <div className="flex gap-3">
              <ImageWithFallback
                src={item.thumbnail}
                alt={item.blockName}
                className="w-20 h-20 rounded-lg object-cover border border-slate-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                {item.blockCode && (
                  <div className="text-xs text-slate-500 mb-1">{item.blockCode}</div>
                )}
                <h4 className="text-slate-900 mb-2 line-clamp-2">{item.blockName}</h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-pink-50 text-[#E5007D] mb-3">
                  {item.generation}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                asChild
              >
                <a
                  href={item.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  Open Drive
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
              {isAdmin && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item.id)}
                    className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}