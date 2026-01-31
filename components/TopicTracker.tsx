import React, { useEffect, useRef } from 'react';
import { Topic } from '../types';
import { TagIcon, LoadingIcon } from './Icons';

interface TopicTrackerProps {
  topics: Topic[];
  isLoading: boolean;
  newTopicTrigger: number;
}

const TopicTracker: React.FC<TopicTrackerProps> = ({ topics, isLoading, newTopicTrigger }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (newTopicTrigger > 0 && containerRef.current) {
      const el = containerRef.current;
      el.classList.add('animate-glow');
      const timer = setTimeout(() => el.classList.remove('animate-glow'), 1500);
      return () => clearTimeout(timer);
    }
  }, [newTopicTrigger]);
  
  return (
    <div ref={containerRef} className="mt-8 p-4 rounded-lg transition-shadow">
      <h3 className="flex items-center text-lg font-semibold text-indigo-400 mb-3">
        <TagIcon className="w-6 h-6" />
        <span className="ml-2">Topic Tracker</span>
      </h3>
      {isLoading && topics.length === 0 && (
         <div className="flex items-center text-gray-500 py-4">
            <LoadingIcon className="w-5 h-5 animate-spin mr-2" />
            <span>Analyzing topics...</span>
         </div>
      )}
      {topics.length === 0 && !isLoading && (
        <p className="text-gray-500">Topics will appear here as the lecture progresses.</p>
      )}
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic, index) => (
            <span key={index} title={`Identified at ${topic.timestamp}`} className="bg-gray-700 text-indigo-300 text-sm font-medium px-3 py-1 rounded-full cursor-default">
              {topic.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicTracker;