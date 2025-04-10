import { TimelineItem } from "@/lib/timelineItems";
import { TimelineItemWithLane } from "@/types/types";

interface ProcessableItem extends TimelineItemWithLane {
  _processed?: boolean;
}

function assignLanes(items: TimelineItem[]): TimelineItem[][] {
  const itemsCopy = JSON.parse(JSON.stringify(items)) as ProcessableItem[];
  
  const sortedItems = itemsCopy.sort(
    (a: ProcessableItem, b: ProcessableItem) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  
  const lanes: TimelineItem[][] = [];
  
  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    if (typeof item._laneIndex === 'number') {
      while (lanes.length <= item._laneIndex) {
        lanes.push([]);
      }
      lanes[item._laneIndex].push(item);
      item._processed = true;
    }
  }
  
  const remainingItems = sortedItems.filter(item => !item._processed);
  
  function assignItemToLane(item: TimelineItem): void {
    for (const lane of lanes) {
      if (lane.length === 0 || 
          new Date(lane[lane.length - 1].end).getTime() < new Date(item.start).getTime()) {
        lane.push(item);
        return;
      }
    }
    lanes.push([item]);
  }

  for (const item of remainingItems) {
    assignItemToLane(item);
  }
  
  return lanes;
}

export default assignLanes;
