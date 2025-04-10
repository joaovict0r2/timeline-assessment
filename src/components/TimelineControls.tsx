import { TimelineControlsProps } from '../types/types';

export const TimelineControls = ({ onZoomIn, onZoomOut }: TimelineControlsProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <div className="bg-gray-200 px-1 rounded-md flex items-center">
          <button 
            onClick={onZoomOut} 
            className="p-1.5 hover:bg-gray-300 rounded-l-md transition-colors"
            aria-label="Zoom out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
          <button 
            onClick={onZoomIn} 
            className="p-1.5 hover:bg-gray-300 rounded-r-md transition-colors"
            aria-label="Zoom in"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}; 