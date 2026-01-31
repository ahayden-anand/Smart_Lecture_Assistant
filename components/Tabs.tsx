import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="border-b border-gray-700 flex-shrink-0">
      <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            } flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
