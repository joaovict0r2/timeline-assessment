import React from 'react';
import { TimelineItem } from '@/lib/timelineItems';

export interface TimelineItemWithLane extends TimelineItem {
  _laneIndex?: number;
}

export interface ItemDragState {
  id: number;
  edge: 'start' | 'end' | 'move';
  initialX: number;
  initialY: number;
  initialDate: Date;
  sourceLaneIndex: number;
  currentLaneIndex: number;
}

export interface ColorSet {
  bg: string;
  border: string;
  hover: string;
}

export interface Label {
  date: Date;
  position: number;
}

export interface TimelineHeaderProps {
  minDate: Date;
  maxDate: Date;
  dayWidth: number;
  scale: number;
}

export interface TimelineControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export interface TimelineItemProps {
  item: TimelineItem;
  minDate: Date;
  dayWidth: number;
  isBeingDragged: boolean;
  isDraggingEdge: boolean;
  isEditing: boolean;
  editValue: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onStartDrag: (e: React.MouseEvent, id: number, edge: 'start' | 'end' | 'move') => void;
  onDoubleClick: (e: React.MouseEvent, id: number) => void;
  onEditChange: (value: string) => void;
  onSaveEdit: () => void;
  formatDateRange: (start: string, end: string) => string;
}

export interface TimelineLaneProps {
  lane: TimelineItem[];
  laneIndex: number;
  minDate: Date;
  dayWidth: number;
  isDragTarget: boolean;
  draggedItemId: number | null;
  draggedItemEdge: 'start' | 'end' | 'move' | null;
  editingItemId: number | null;
  editValue: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onStartDrag: (e: React.MouseEvent, id: number, edge: 'start' | 'end' | 'move') => void;
  onDoubleClick: (e: React.MouseEvent, id: number) => void;
  onEditChange: (value: string) => void;
  onSaveEdit: () => void;
  formatDateRange: (start: string, end: string) => string;
  setRef: (el: HTMLDivElement | null, index: number) => void;
} 