import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Award,
  BookOpen,
  Plus,
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
import {
  getActivities,
  addActivity,
  editActivity,
  removeActivity,
} from "../../lib/dataService";
import { Activity } from "../../lib/types";
import {
  AddActivityDialog,
  type ActivityFormData,
} from "../admin/AddActivityDialog";
import { EditActivityDialog } from "../admin/EditActivityDialog";
import { DeleteConfirmDialog } from "../admin/DeleteConfirmDialog";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableActivityCard } from "./SortableActivityCard";
import { reorderActivitiesData } from "../../lib/dataService";

interface AcademicActivitiesSectionProps {
  isAdmin?: boolean;
}

const iconMap: Record<string, any> = {
  Users,
  Award,
  BookOpen,
  Calendar,
};

export function AcademicActivitiesSection({
  isAdmin = false,
}: AcademicActivitiesSectionProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      const data = await getActivities();
      setActivities(data);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setIsLoading(false);
    }
  }

  //Add
  const handleSubmitActivity = async (data: ActivityFormData) => {
    await addActivity(data);
    await loadData();
  };

  //Edit — เปิด dialog พร้อมข้อมูลเดิม
  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsEditDialogOpen(true);
  };

  const handleSubmitEdit = async (data: ActivityFormData & { id: string }) => {
    await editActivity(data.id, data);
    await loadData();
  };

  //Delete — เปิด confirm dialog
  const handleDeleteActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedActivity) return;
    await removeActivity(selectedActivity.id);
    await loadData();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activities.findIndex((a) => a.id === active.id);
    const newIndex = activities.findIndex((a) => a.id === over.id);
    const newOrder = arrayMove(activities, oldIndex, newIndex);

    setActivities(newOrder); // อัปเดตหน้าจอทันที (optimistic)
    await reorderActivitiesData(newOrder.map((a) => a.id)); // ค่อยเซฟลง DB
  };

  return (
    <div className="pb-20 lg:pb-10">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h1 className="text-slate-900 font-bold text-[24px]">
            Academic Activities
          </h1>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#E5007D] hover:bg-[#c00069] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Activity
            </Button>
          )}
        </div>
        <p className="text-slate-600 text-sm sm:text-base">
          Events, workshops, and collaborative learning opportunities
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-slate-600">Loading...</div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activities.map((a) => a.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {activities.map((activity) => (
                <SortableActivityCard
                  key={activity.id}
                  activity={activity}
                  Icon={iconMap[activity.icon] || Calendar}
                  isAdmin={isAdmin}
                  onEdit={handleEditActivity}
                  onDelete={handleDeleteActivity}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add, Edit, Delete Dialogs */}
      <AddActivityDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleSubmitActivity}
      />

      {selectedActivity && (
        <EditActivityDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleSubmitEdit}
          initialData={selectedActivity}
        />
      )}

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        itemName={selectedActivity?.title ?? ""}
        itemType="activity"
      />
    </div>
  );
}
