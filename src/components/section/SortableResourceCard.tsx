import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import type { ResourceCategory } from "../../lib/types";

interface Props {
  category: ResourceCategory;
  Icon: any;
  isAdmin: boolean;
  onEdit: (category: ResourceCategory) => void;
  onDelete: (category: ResourceCategory) => void;
}

export function SortableResourceCard({
  category,
  Icon,
  isAdmin,
  onEdit,
  onDelete,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isAdmin ? { ...attributes, ...listeners } : {})}
      className={
        isAdmin ? "cursor-grab active:cursor-grabbing touch-manipulation" : ""
      }
    >
      <Card className="hover:shadow-lg transition-shadow overflow-hidden relative isolate">
        {isAdmin && (
          <div className="absolute top-2 left-2 z-30 bg-white shadow-md rounded-md p-1.5 border border-slate-300 pointer-events-none">
            <GripVertical className="w-4 h-4 text-slate-600" />
          </div>
        )}

        {category.image_url && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={category.image_url}
              alt={category.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <CardHeader className="pb-3">
          <div
            className="flex items-start justify-between mb-3 sm:mb-4"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5007D]" />
            </div>
            {isAdmin && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(category)}
                  className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50 h-8 w-8 p-0"
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(category)}
                  className="border-red-300 text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
          <CardTitle className="text-base sm:text-lg">
            {category.title}
          </CardTitle>
          <CardDescription
            className="text-sm"
            style={{ whiteSpace: "pre-line" }}
          >
            {category.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 mb-4">
            {category.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg"
              >
                <span className="text-xs sm:text-sm text-slate-700 truncate pr-2">
                  {item.name}
                </span>
                <span className="text-xs text-slate-500 shrink-0">
                  {item.type}
                </span>
              </div>
            ))}
          </div>

          <div onPointerDown={(e) => e.stopPropagation()}>
            <Link
              to={`/resources/${category.id}`}
              className="inline-flex items-center gap-2 text-[#E5007D] font-bold text-sm"
            >
              View Detail <ArrowRight size={16} />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
