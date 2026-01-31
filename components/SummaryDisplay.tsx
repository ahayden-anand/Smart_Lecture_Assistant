
import React from 'react';
import { SummaryData } from '../types';
import { BookOpenIcon, KeyIcon, CheckCircleIcon, LoadingIcon } from './Icons';

interface SummaryDisplayProps {
  summary: SummaryData | null;
  isLoading: boolean;
}

const SummarySection: React.FC<{ title: string; items: string[]; icon: React.ReactNode }> = ({ title, items, icon }) => (
  <div>
    <h3 className="flex items-center text-lg font-semibold text-indigo-400 mb-3">
      {icon}
      <span className="ml-2">{title}</span>
    </h3>
    <ul className="space-y-2 list-disc list-inside text-gray-300">
      {items.map((item, index) => (
        <li key={index} className="leading-relaxed">{item}</li>
      ))}
    </ul>
  </div>
);

const SummarySkeleton: React.FC = () => (
    <div className="space-y-8 animate-pulse">
      {[...Array(3)].map((_, i) => (
         <div key={i}>
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
         </div>
      ))}
    </div>
);

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return <SummarySkeleton />;
  }

  if (!summary) {
    return (
      <div className="text-center text-gray-500 py-10">
        <p>Summarize the transcript to see the analysis here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SummarySection title="Summary" items={summary.summary} icon={<BookOpenIcon className="w-6 h-6" />} />
      <SummarySection title="Key Terms & Definitions" items={summary.key_terms} icon={<KeyIcon className="w-6 h-6" />} />
      <SummarySection title="Action Items" items={summary.action_items} icon={<CheckCircleIcon className="w-6 h-6" />} />
    </div>
  );
};

export default SummaryDisplay;
