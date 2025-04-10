import './index.css';
import Timeline from './components/Timeline';
import timelineItems from './lib/timelineItems.ts';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Timeline items={timelineItems} />      
      </div>
    </div>
  );
}

export default App;
