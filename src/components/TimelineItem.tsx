import React from 'react';
import { cn } from '@/lib/utils';
import { TimelineItemProps } from '../types/types';
import { getItemStyle, getItemColor } from '../lib/timelineUtils';

export const TimelineItemComponent: React.FC<TimelineItemProps> = ({
  item,
  minDate,
  dayWidth,
  isBeingDragged,
  isDraggingEdge,
  isEditing,
  editValue,
  inputRef,
  onStartDrag,
  onDoubleClick,
  onEditChange,
  onSaveEdit,
  formatDateRange
}) => {
  const colorSet = getItemColor(item.id);
  
  const shouldShowDates = dayWidth * (new Date(item.end).getTime() - new Date(item.start).getTime()) / (1000 * 60 * 60 * 24) > 50;
  
  return (
    <div 
      className={cn(
        "absolute top-2 h-10 border rounded-md overflow-hidden shadow-sm flex flex-col justify-center px-2 timeline-item",
        !isDraggingEdge ? "transition-[width,left] duration-75" : "",
        colorSet.bg,
        colorSet.border,
        colorSet.hover,
        isBeingDragged ? "ring-2 ring-blue-500 z-20" : ""
      )}
      style={getItemStyle(item, minDate, dayWidth)}
      title={!isEditing ? `${item.name} (${item.start} to ${item.end})` : undefined}
      onMouseDown={(e) => onStartDrag(e, item.id, 'move')}
      onDoubleClick={(e) => onDoubleClick(e, item.id)}
    >
      {isEditing ? (
        <div className="absolute inset-0 flex items-center timeline-item-edit" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={onSaveEdit}
            onKeyDown={(e) => e.key === 'Enter' && onSaveEdit()}
            className="w-full h-full px-2 py-1 border-0 focus:ring-0 bg-transparent"
          />
        </div>
      ) : (
        <>
          <div className="whitespace-nowrap overflow-hidden text-ellipsis text-sm font-medium">
            {item.name}
          </div>
          {shouldShowDates && (
            <div className="text-xs text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
              {formatDateRange(item.start, item.end)}
            </div>
          )}
          
          <div 
            className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize hover:bg-blue-200 hover:opacity-50"
            onMouseDown={(e) => onStartDrag(e, item.id, 'start')}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-blue-200 hover:opacity-50"
            onMouseDown={(e) => onStartDrag(e, item.id, 'end')}
          />
        </>
      )}
    </div>
  );
}; 