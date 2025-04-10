import { TimelineItem } from '@/lib/timelineItems';
import { ColorSet } from '../types/types';

export const formatDateString = (date: Date): string => {
  // Ensure the date is normalized to midnight in local time zone
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate.toISOString().split('T')[0];
};

export const formatDateRange = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  if (startDate.toDateString() === endDate.toDateString()) {
    return startDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
    return `${startDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${endDate.getDate()}, ${endDate.getFullYear()}`;
  }
  
  if (startDate.getFullYear() === endDate.getFullYear()) {
    return `${startDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}, ${endDate.getFullYear()}`;
  }
  
  return `${startDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

export const getItemStyle = (item: TimelineItem, minDate: Date, dayWidth: number) => {
  const itemStart = new Date(item.start);
  const itemEnd = new Date(item.end);
  
  const daysFromStart = Math.floor((itemStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const duration = Math.ceil((itemEnd.getTime() - itemStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  return {
    left: `${daysFromStart * dayWidth}px`,
    width: `${duration * dayWidth}px`,
    willChange: 'left, width',
  };
};

export const getItemColor = (id: number): ColorSet => {
  const colors: ColorSet[] = [
    { bg: 'bg-blue-100', border: 'border-blue-500', hover: 'hover:bg-blue-200' },
    { bg: 'bg-green-100', border: 'border-green-500', hover: 'hover:bg-green-200' },
    { bg: 'bg-purple-100', border: 'border-purple-500', hover: 'hover:bg-purple-200' },
    { bg: 'bg-orange-100', border: 'border-orange-500', hover: 'hover:bg-orange-200' },
    { bg: 'bg-pink-100', border: 'border-pink-500', hover: 'hover:bg-pink-200' },
  ];
  return colors[id % colors.length];
}; 