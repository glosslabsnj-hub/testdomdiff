import { useState, useRef } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CustomRoutine } from "@/hooks/useCustomRoutines";
import CustomRoutineItem from "./CustomRoutineItem";

interface DraggableRoutineListProps {
  routines: CustomRoutine[];
  onReorder: (orderedIds: string[]) => Promise<boolean>;
  onToggle: (id: string) => void;
  isCompleted: (id: string) => boolean;
  getCompletionTime: (id: string) => string | undefined;
  onUpdate: (id: string, updates: { time_slot?: string; action_text?: string }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function DraggableRoutineList({
  routines,
  onReorder,
  onToggle,
  isCompleted,
  getCompletionTime,
  onUpdate,
  onDelete,
}: DraggableRoutineListProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const dragStartY = useRef<number>(0);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    dragStartY.current = e.clientY;
    e.dataTransfer.effectAllowed = "move";
    // Add a small delay to allow the drag image to form
    requestAnimationFrame(() => {
      const elem = document.getElementById(`routine-${id}`);
      if (elem) elem.classList.add("opacity-50");
    });
  };

  const handleDragEnd = async () => {
    if (draggedId) {
      const elem = document.getElementById(`routine-${draggedId}`);
      if (elem) elem.classList.remove("opacity-50");
    }

    if (draggedId && dragOverId && draggedId !== dragOverId) {
      setIsReordering(true);
      
      // Calculate new order
      const currentOrder = routines.map(r => r.id);
      const draggedIndex = currentOrder.indexOf(draggedId);
      const targetIndex = currentOrder.indexOf(dragOverId);
      
      // Remove dragged item and insert at new position
      currentOrder.splice(draggedIndex, 1);
      currentOrder.splice(targetIndex, 0, draggedId);
      
      await onReorder(currentOrder);
      setIsReordering(false);
    }

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  if (routines.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {routines.map((routine) => (
        <div
          key={routine.id}
          id={`routine-${routine.id}`}
          draggable={!isReordering}
          onDragStart={(e) => handleDragStart(e, routine.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, routine.id)}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative group transition-all duration-200",
            draggedId === routine.id && "scale-[1.02] shadow-lg z-10",
            dragOverId === routine.id && draggedId !== routine.id && "border-t-2 border-primary pt-2"
          )}
        >
          <div className="flex items-stretch gap-0">
            {/* Drag Handle */}
            <div 
              className={cn(
                "flex items-center justify-center px-2 cursor-grab active:cursor-grabbing",
                "text-muted-foreground/50 hover:text-muted-foreground transition-colors",
                "opacity-0 group-hover:opacity-100 md:opacity-100",
                "touch-none select-none"
              )}
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4" />
            </div>
            
            {/* Routine Item */}
            <div className="flex-1">
              <CustomRoutineItem
                routine={routine}
                completed={isCompleted(`custom_${routine.id}`)}
                completionTime={getCompletionTime(`custom_${routine.id}`)}
                onToggle={() => onToggle(`custom_${routine.id}`)}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            </div>
          </div>
        </div>
      ))}
      
      {isReordering && (
        <div className="text-center py-2 text-sm text-muted-foreground animate-pulse">
          Saving new order...
        </div>
      )}
    </div>
  );
}
