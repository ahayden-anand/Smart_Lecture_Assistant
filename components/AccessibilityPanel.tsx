import React, { useState } from 'react';
import { AdjustmentsHorizontalIcon, SunIcon, MoonIcon } from './Icons';

interface AccessibilityPanelProps {
  onFontSizeChange: (size: string) => void;
  onHighContrastToggle: (enabled: boolean) => void;
  highContrast: boolean;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  onFontSizeChange,
  onHighContrastToggle,
  highContrast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const fontSizes = [
    { name: 'Small', value: '0.875rem' },
    { name: 'Normal', value: '1rem' },
    { name: 'Large', value: '1.25rem' },
    { name: 'Extra Large', value: '1.5rem' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-20 bg-[var(--accent-color)] text-white p-4 rounded-full shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] focus:ring-offset-gray-800 transition-transform hover:scale-110"
        aria-label="Accessibility Settings"
      >
        <AdjustmentsHorizontalIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-20 w-64 bg-[var(--panel-bg-color)] border border-[var(--border-color)] rounded-lg shadow-2xl p-4 text-[var(--text-color-primary)]">
          <h3 className="font-bold mb-4 text-lg">Accessibility</h3>

          {/* Font Size */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-color-secondary)] mb-2">
              Font Size
            </label>
            <div className="flex justify-between gap-1">
              {fontSizes.map(({ name, value }) => (
                <button
                  key={name}
                  onClick={() => onFontSizeChange(value)}
                  className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  title={name}
                >
                  A
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-color-secondary)] mb-2">
              Contrast
            </label>
            <button
              onClick={() => onHighContrastToggle(!highContrast)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
            >
              {highContrast ? (
                <>
                  <SunIcon className="w-5 h-5" /> Default
                </>
              ) : (
                <>
                  <MoonIcon className="w-5 h-5" /> High Contrast
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityPanel;