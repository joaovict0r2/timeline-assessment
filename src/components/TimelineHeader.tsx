import { useMemo } from 'react';
import { Label, TimelineHeaderProps } from './types';

export const TimelineHeader = ({ minDate, maxDate, dayWidth, scale }: TimelineHeaderProps) => {
  const monthLabels = useMemo(() => {
    const labels: Label[] = [];
    const currentDate = new Date(minDate);
    const endDate = new Date(maxDate);
    
    while (currentDate <= endDate) {
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      if (firstDayOfMonth >= minDate && firstDayOfMonth <= maxDate) {
        const daysFromStart = Math.floor((firstDayOfMonth.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
        const position = daysFromStart * dayWidth;
        
        labels.push({
          date: new Date(firstDayOfMonth),
          position
        });
      }
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return labels;
  }, [minDate, maxDate, dayWidth]);
  
  const dayLabels = useMemo(() => {
    if (scale < 1.5) return [];
    
    const labels: Label[] = [];
    const currentDate = new Date(minDate);
    currentDate.setHours(0, 0, 0, 0);
    const endDate = new Date(maxDate);
    
    while (currentDate <= endDate) {
      const daysFromStart = Math.floor((currentDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
      const position = daysFromStart * dayWidth;
      
      if (scale >= 2 || currentDate.getDate() % 2 === 0) {
        labels.push({
          date: new Date(currentDate),
          position
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return labels;
  }, [minDate, maxDate, dayWidth, scale]);
  
  return (
    <div className="h-14 border-b border-gray-200 sticky top-0 bg-gray-50 z-10">
      <div className="h-7 border-b border-gray-200 relative">
        {monthLabels.map((label, idx) => (
          <div 
            key={`month-${idx}`} 
            className="absolute top-0 h-full border-l border-gray-300 text-xs font-medium text-gray-600 flex items-end pb-1 pl-2"
            style={{ left: `${label.position}px` }}
          >
            {label.date.toLocaleDateString('default', { month: 'short', year: 'numeric' })}
          </div>
        ))}
      </div>
      
      <div className="h-7 relative">
        {dayLabels.map((label, idx) => (
          <div 
            key={`day-${idx}`} 
            className="absolute top-0 h-full border-l border-gray-200 text-xs text-gray-500 flex items-end pb-1 pl-1"
            style={{ left: `${label.position}px` }}
          >
            {label.date.getDate()}
          </div>
        ))}
      </div>
    </div>
  );
}; 