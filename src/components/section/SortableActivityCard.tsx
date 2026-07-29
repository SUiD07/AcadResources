import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import type { Activity } from "../../lib/types";

interface Props {
  activity: Activity;
  Icon: any;
  isAdmin: boolean;
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
}

export function SortableActivityCard({
  activity,
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
    id: activity.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:shadow-lg transition-shadow overflow-hidden relative isolate">
        {" "}
        {isAdmin && (
          <button
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 z-30 bg-white shadow-md rounded-md p-1.5 cursor-grab active:cursor-grabbing border border-slate-300"
          >
            <GripVertical className="w-6 h-6 text-slate-600" />
          </button>
        )}
        {activity.image_url && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={activity.image_url}
              alt={activity.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#E5007D]" />
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs ${
                activity.status === "Completed"
                  ? "bg-green-50 text-green-700"
                  : activity.status === "Upcoming"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-pink-50 text-[#E5007D]"
              }`}
            >
              {activity.status}
            </span>
          </div>
          <CardTitle className="text-base sm:text-lg">
            {activity.title}
          </CardTitle>
          <CardDescription className="text-sm">
            {activity.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>
              {new Date(activity.date).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <Clock className="h-4 w-4 ml-2" />
            <span>
              {new Date(activity.date).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              น.
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Link
              to={`/activities/${activity.id}`}
              className="inline-flex items-center gap-2 text-[#E5007D] font-bold text-sm"
            >
              View Details <ArrowRight size={16} />
            </Link>

            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(activity)}
                  className="border-[#E5007D] text-[#E5007D] hover:bg-pink-50"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(activity)}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
