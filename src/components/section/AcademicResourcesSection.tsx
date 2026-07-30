import { useState, useEffect } from "react";
import {
  FileText,
  BookOpen,
  Video,
  Link as LinkIcon,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  getResourceCategories,
  addResourceCategory,
  editResourceCategory,
  removeResourceCategory,
} from "../../lib/dataService";
import type { ResourceCategory } from "../../lib/types";
import { AddResourceCategoryDialog } from "../admin/AddResourceCategoryDialog";
import { EditResourceCategoryDialog } from "../admin/EditResourceCategoryDialog";
import { DeleteConfirmDialog } from "../admin/DeleteConfirmDialog";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableResourceCard } from "./SortableResourceCard";
import { reorderResourceCategoriesData } from "../../lib/dataService";

const iconMap: Record<string, any> = { BookOpen, FileText, Video, LinkIcon };

export function AcademicResourcesSection({
  isAdmin = false,
}: {
  isAdmin?: boolean;
}) {
  const [resourceCategories, setResourceCategories] = useState<
    ResourceCategory[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ResourceCategory | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      const data = await getResourceCategories();
      setResourceCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  //Add
  const handleAddResource = async (formData: any) => {
    await addResourceCategory(formData); // เรียก service จริง
    await loadData(); // reload
  };

  // Edit — เปิด dialog พร้อมข้อมูลเดิม
  const handleEditCategory = (category: ResourceCategory) => {
    setSelectedCategory(category);
    setEditOpen(true);
  };

  const handleEditSubmit = async (formData: any) => {
    await editResourceCategory(formData.id, formData);
    await loadData();
  };

  // Delete — เปิด confirm dialog
  const handleDeleteCategory = (category: ResourceCategory) => {
    setSelectedCategory(category);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    await removeResourceCategory(selectedCategory.id);
    await loadData();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = resourceCategories.findIndex((c) => c.id === active.id);
    const newIndex = resourceCategories.findIndex((c) => c.id === over.id);
    const newOrder = arrayMove(resourceCategories, oldIndex, newIndex);

    setResourceCategories(newOrder); // อัปเดตหน้าจอทันที
    await reorderResourceCategoriesData(newOrder.map((c) => c.id)); // เซฟลง DB
  };
  return (
    <div className="pb-20 lg:pb-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h1 className="text-slate-900 text-[24px] font-bold">
            Academic Resources
          </h1>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              className="bg-[#E5007D] hover:bg-[#c00069] text-white"
            >
              <Plus className="w-4 h-4 mr-2" /> Add New Resource
            </Button>
          )}
        </div>
        <p className="text-slate-600 text-sm sm:text-base">
          Official materials and recommended resources for your studies
        </p>
      </div>

      {/* Cards */}
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
            items={resourceCategories.map((c) => c.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {resourceCategories.map((category) => (
                <SortableResourceCard
                  key={category.id}
                  category={category}
                  Icon={iconMap[category.icon] || BookOpen}
                  isAdmin={isAdmin}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AddResourceCategoryDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAddResource}
      />

      {selectedCategory && (
        <EditResourceCategoryDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          onSubmit={handleEditSubmit}
          initialData={selectedCategory}
        />
      )}

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        itemName={selectedCategory?.title ?? ""}
        itemType="resource category"
      />
    </div>
  );
}
