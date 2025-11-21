import { ExternalLink, FolderOpen } from 'lucide-react';
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
}

export function ContentCategory({ categoryName, items }: ContentCategoryProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
        <h3 className="text-slate-900">{categoryName}</h3>
        <p className="text-sm text-slate-600">{items.length} resources available</p>
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
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
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 mb-3">
                  {item.generation}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              asChild
            >
              <a
                href={item.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Open in Google Drive
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}