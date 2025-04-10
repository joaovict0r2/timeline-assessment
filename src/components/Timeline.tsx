import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TimelineItem as TimelineItemType } from '@/lib/timelineItems';
import { TimelineHeader } from './TimelineHeader';
import { TimelineControls } from './TimelineControls';
import { TimelineLane } from './TimelineLane';
import { ItemDragState, TimelineItemWithLane } from './types';
import { formatDateString, formatDateRange } from './timelineUtils';
import assignLanes from '../lib/assignLanes';

interface TimelineProps {
  items: TimelineItemType[];
  className?: string;
}

const calculateTimelineBoundaries = (items: TimelineItemType[], scale: number) => {
  const allDates = items.flatMap(item => [new Date(item.start), new Date(item.end)]);
  
  const min = new Date(Math.min(...allDates.map(d => d.getTime())));
  const max = new Date(Math.max(...allDates.map(d => d.getTime())));  
  
  min.setDate(min.getDate() - 5);
  max.setDate(max.getDate() + 5);
  
  const days = Math.ceil((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24));
  const width = 24 * scale;
  
  return { minDate: min, maxDate: max, totalDays: days, dayWidth: width };
};

const createDateChangeHandler = (draggedItem: ItemDragState, dayWidth: number, item: TimelineItemType) => {
  return (deltaDays: number) => {
    const newDate = new Date(draggedItem.initialDate);
    newDate.setTime(newDate.getTime() + (deltaDays * 24 * 60 * 60 * 1000));

    if (draggedItem.edge === 'start') {
      const endDate = new Date(item.end);
      if (newDate.getTime() >= endDate.getTime() - 3600000) return null;
      
      return { 
        ...item,
        start: formatDateString(newDate)
      };
    } else if (draggedItem.edge === 'end') {
      const startDate = new Date(item.start);
      if (newDate.getTime() <= startDate.getTime() + 3600000) return null;
      
      return {
        ...item,
        end: formatDateString(newDate)
      };
    } else {
      const startDate = new Date(item.start);
      const endDate = new Date(item.end);
      const duration = endDate.getTime() - startDate.getTime();
      
      const newStartDate = new Date(draggedItem.initialDate);
      newStartDate.setTime(newStartDate.getTime() + (deltaDays * 24 * 60 * 60 * 1000));
      
      const newEndDate = new Date(newStartDate);
      newEndDate.setTime(newStartDate.getTime() + duration);
      
      return {
        ...item,
        start: formatDateString(newStartDate),
        end: formatDateString(newEndDate)
      };
    }
  };
};

export const Timeline = ({ items, className }: TimelineProps) => {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [timelineItems, setTimelineItems] = useState<TimelineItemType[]>(items);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [draggedItem, setDraggedItem] = useState<ItemDragState | null>(null);
  

  const containerRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const laneRefs = useRef<(HTMLDivElement | null)[]>([]);
  

  const { minDate, maxDate, totalDays, dayWidth } = useMemo(() => 
    calculateTimelineBoundaries(timelineItems, scale),
  [timelineItems, scale]);
  
  const lanes = useMemo(() => {
    return assignLanes(timelineItems);
  }, [timelineItems]);

  useEffect(() => {
    laneRefs.current = laneRefs.current.slice(0, lanes.length);
  }, [lanes.length]);
  
  useEffect(() => {
    if (draggedItem || isDragging) {
      document.body.classList.add('select-none');
    } else {
      document.body.classList.remove('select-none');
    }
    
    return () => {
      document.body.classList.remove('select-none');
    };
  }, [draggedItem, isDragging]);
  
  const handleSaveItemName = useCallback(() => {
    if (editingItem === null) return;
    
    const newItems = [...timelineItems];
    const itemIndex = newItems.findIndex(item => item.id === editingItem);
    
    if (itemIndex !== -1 && editValue.trim()) {
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        name: editValue.trim()
      };
      
      setTimelineItems(newItems);
    }
    
    setEditingItem(null);
  }, [editingItem, editValue, timelineItems]);
  
  const handleItemDoubleClick = useCallback((e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const item = timelineItems.find(item => item.id === id);
    if (!item) return;
    
    setEditingItem(id);
    setEditValue(item.name);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 10);
  }, [timelineItems]);
  
  useEffect(() => {
    if (editingItem === null) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.timeline-item-edit')) {
        handleSaveItemName();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingItem, handleSaveItemName]);
  
  const findItemLaneIndex = useCallback((itemId: number): number => {
    for (let i = 0; i < lanes.length; i++) {
      if (lanes[i].some(item => item.id === itemId)) {
        return i;
      }
    }
    return -1;
  }, [lanes]);
  
  const getLaneFromMousePosition = useCallback((clientY: number): number => {
    if (!timelineBodyRef.current) return -1;
    
    const timelineRect = timelineBodyRef.current.getBoundingClientRect();
    const relativeY = clientY - timelineRect.top;
    
    const laneHeight = 56; 
    const laneIndex = Math.floor(relativeY / laneHeight);
    
    return Math.max(0, Math.min(lanes.length - 1, laneIndex));
  }, [lanes.length, timelineBodyRef]);
  
  const handleLaneChange = useCallback((
    items: TimelineItemType[],
    itemId: number, 
    newLaneIndex: number
  ) => {
    const itemIndex = items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return items;
    
    const newItems = [...items];
    const updatedItem = {...newItems[itemIndex]} as TimelineItemWithLane;
    
    updatedItem._laneIndex = newLaneIndex;
    
    newItems[itemIndex] = updatedItem;
    return newItems;
  }, []);
  
  const handleDateChange = useCallback((
    item: TimelineItemType, 
    draggedItem: ItemDragState, 
    newDate: Date, 
    deltaDays: number
  ) => {
    return (prevItems: TimelineItemType[]) => {
      const newItems = [...prevItems];
      const itemIndex = newItems.findIndex(i => i.id === draggedItem.id);
      
      if (itemIndex === -1) return prevItems;
      
      const dateHandler = createDateChangeHandler(draggedItem, dayWidth, item);
      const updatedItem = dateHandler(deltaDays);
      
      if (!updatedItem) return prevItems;
      
      newItems[itemIndex] = updatedItem;
      return newItems;
    };
  }, [dayWidth]);
  
  const handleItemDrag = useCallback((e: MouseEvent) => {
    if (!draggedItem) return;
    
    e.preventDefault();
    
    const item = timelineItems.find(item => item.id === draggedItem.id);
    if (!item) return;
    
    const deltaX = e.clientX - draggedItem.initialX;
    const deltaDays = deltaX / dayWidth;
    
    if (draggedItem.edge !== 'move' && Math.abs(deltaX) < 1) return;
    
    const shouldUpdateDates = draggedItem.edge !== 'move' || deltaDays !== 0;
    
    let currentLaneIndex = draggedItem.currentLaneIndex;
    if (draggedItem.edge === 'move') {
      const newLaneIndex = getLaneFromMousePosition(e.clientY);
      if (newLaneIndex !== -1 && newLaneIndex !== currentLaneIndex) {
        currentLaneIndex = newLaneIndex;
      }
    }
    
    const shouldUpdateLane = draggedItem.edge === 'move' && currentLaneIndex !== draggedItem.currentLaneIndex;
    
    if (!shouldUpdateDates && !shouldUpdateLane) return;
    
    const newDate = new Date(draggedItem.initialDate);
    newDate.setTime(newDate.getTime() + (deltaDays * 24 * 60 * 60 * 1000));

    setTimelineItems(prevItems => {
      let updatedItems = prevItems;
      
      if (shouldUpdateDates) {
        updatedItems = handleDateChange(item, draggedItem, newDate, deltaDays)(updatedItems);
      }
      
      if (shouldUpdateLane && draggedItem) {
        updatedItems = handleLaneChange(updatedItems, draggedItem.id, currentLaneIndex);
      }
      
      return updatedItems;
    });
    
    if (draggedItem.edge === 'move') {
      setDraggedItem({
        ...draggedItem,
        initialX: e.clientX,
        initialDate: newDate,
        currentLaneIndex
      });
    } else {
      setDraggedItem({
        ...draggedItem,
        currentLaneIndex
      });
    }
  }, [draggedItem, timelineItems, dayWidth, getLaneFromMousePosition, handleDateChange, handleLaneChange]);
  
  const handleItemDragStart = useCallback((e: React.MouseEvent, id: number, edge: 'start' | 'end' | 'move') => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isDragging) return;
    
    const item = timelineItems.find(item => item.id === id);
    if (!item) return;
    
    const initialDate = edge === 'end' ? new Date(item.end) : new Date(item.start);
    const laneIndex = findItemLaneIndex(id);
    
    if (laneIndex === -1) return;
    
    setDraggedItem({
      id,
      edge,
      initialX: e.clientX,
      initialY: e.clientY,
      initialDate,
      sourceLaneIndex: laneIndex,
      currentLaneIndex: laneIndex
    });
    
    document.body.style.cursor = edge === 'move' ? 'grabbing' : (edge === 'start' ? 'w-resize' : 'e-resize');
  }, [isDragging, timelineItems, findItemLaneIndex]);
  
  const handleItemDragEnd = useCallback((e: MouseEvent) => {
    if (!draggedItem) return;
    
    e.preventDefault();

    const shouldFinalizeLaneChange = 
      draggedItem.edge === 'move' && 
      draggedItem.currentLaneIndex !== draggedItem.sourceLaneIndex;
      
    if (shouldFinalizeLaneChange) {
      const itemIndex = timelineItems.findIndex(i => i.id === draggedItem.id);
      
      if (itemIndex !== -1) {
        const hasLaneAssignment = typeof (timelineItems[itemIndex] as TimelineItemWithLane)._laneIndex !== 'undefined';
        
        if (!hasLaneAssignment) {
          const updatedItems = handleLaneChange(
            timelineItems, 
            draggedItem.id, 
            draggedItem.currentLaneIndex
          );
          setTimelineItems(updatedItems);
        }
      }
    }

    setDraggedItem(null);
    document.body.style.cursor = '';
  }, [draggedItem, timelineItems, handleLaneChange]);

  const handleTimelineMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || draggedItem) return;
    
    if (
      (e.target as HTMLElement).closest('.timeline-item') || 
      (e.target as HTMLElement).tagName === 'INPUT'
    ) {
      return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  }, [draggedItem]);
  
  const handleTimelineMouseUp = useCallback((e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
    }
    setIsDragging(false);
  }, [isDragging]);
  
  const handleTimelineMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedItem || !isDragging || !containerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  }, [draggedItem, isDragging, scrollLeft, startX]);
  
  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      handleTimelineMouseUp(e);
      
      if (draggedItem) {
        handleItemDragEnd(e);
      }
    };
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggedItem) {
        handleItemDrag(e);
      }
    };
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [draggedItem, handleItemDrag, handleItemDragEnd, handleTimelineMouseUp]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.5, 3));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.5, 0.5));
  }, []);
  
  const setLaneRef = useCallback((el: HTMLDivElement | null, index: number) => {
    laneRefs.current[index] = el;
  }, []);
  
  return (
    <div className={cn("w-full overflow-hidden flex flex-col bg-white rounded-lg shadow-md", className)}>
      <TimelineControls 
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
      
      <div 
        ref={containerRef} 
        className="overflow-x-auto cursor-grab active:cursor-grabbing overflow-y-hidden select-none"
        onMouseDown={handleTimelineMouseDown}
        onMouseMove={handleTimelineMouseMove}
      >
        <div className="relative" style={{ width: `${totalDays * dayWidth}px`, minHeight: "200px" }}>
          <TimelineHeader 
            minDate={minDate}
            maxDate={maxDate}
            dayWidth={dayWidth}
            scale={scale}
          />
          
          <div className="relative" ref={timelineBodyRef}>
            {lanes.map((lane: TimelineItemType[], laneIndex: number) => (
              <TimelineLane
                key={laneIndex}
                lane={lane}
                laneIndex={laneIndex}
                minDate={minDate}
                dayWidth={dayWidth}
                isDragTarget={draggedItem?.currentLaneIndex === laneIndex && draggedItem.edge === 'move'}
                draggedItemId={draggedItem?.id || null}
                draggedItemEdge={draggedItem?.edge || null}
                editingItemId={editingItem}
                editValue={editValue}
                inputRef={inputRef}
                onStartDrag={handleItemDragStart}
                onDoubleClick={handleItemDoubleClick}
                onEditChange={setEditValue}
                onSaveEdit={handleSaveItemName}
                formatDateRange={formatDateRange}
                setRef={setLaneRef}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 p-2 border-t border-gray-200 bg-gray-50">
        Drag to pan • Double-click to edit • Drag edges to resize • Drag item to move (horizontally & vertically)
      </div>
    </div>
  );
};

export default Timeline; 