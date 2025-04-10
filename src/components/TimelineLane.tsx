import React from 'react';
import { cn } from '@/lib/utils';
import { TimelineLaneProps } from '../types/types';
import { TimelineItemComponent } from './TimelineItem';

export const TimelineLane: React.FC<TimelineLaneProps> = ({
  lane,
  laneIndex,
  minDate,
  dayWidth,
  isDragTarget,
  draggedItemId,
  draggedItemEdge,
  editingItemId,
  editValue,
  inputRef,
  onStartDrag,
  onDoubleClick,
  onEditChange,
  onSaveEdit,
  formatDateRange,
  setRef
}) => {
  return (
    <div 
      ref={(el) => setRef(el, laneIndex)}
      className={cn(
        "h-14 relative",
        laneIndex % 2 === 0 ? "bg-white" : "bg-gray-50",
        isDragTarget ? "bg-blue-100 transition-colors duration-75" : ""
      )}
    >
      {lane.map((item) => (
        <TimelineItemComponent
          key={item.id}
          item={item}
          minDate={minDate}
          dayWidth={dayWidth}
          isBeingDragged={draggedItemId === item.id}
          isDraggingEdge={draggedItemId === item.id && draggedItemEdge !== 'move'}
          isEditing={editingItemId === item.id}
          editValue={editValue}
          inputRef={inputRef}
          onStartDrag={onStartDrag}
          onDoubleClick={onDoubleClick}
          onEditChange={onEditChange}
          onSaveEdit={onSaveEdit}
          formatDateRange={formatDateRange}
        />
      ))}
    </div>
  );
}; 