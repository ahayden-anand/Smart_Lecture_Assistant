import React from 'react';
import { MicIcon, StopCircleIcon, SparklesIcon, LoadingIcon, UserPlusIcon } from './Icons';

interface ControlPanelProps {
  isListening: boolean;
  isTranscriptEmpty: boolean;
  onStart: () => void;
  onStop: () => void;
  onSummarize: () => void;
  isSummarizing: boolean;
  onMarkSpeaker: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isListening,
  isTranscriptEmpty,
  onStart,
  onStop,
  onSummarize,
  isSummarizing,
  onMarkSpeaker,
}) => {
  return (
    <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[var(--border-color)]">
      <div className="flex gap-4 w-full sm:w-auto">
        {!isListening ? (
          <button
            onClick={onStart}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-color)] text-white font-semibold rounded-lg shadow-md hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] focus:ring-offset-gray-800 transition-all duration-200"
          >
            <MicIcon className="w-5 h-5" />
            Start
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800 transition-all duration-200 animate-pulse"
          >
            <StopCircleIcon className="w-5 h-5" />
            Stop
          </button>
        )}
        <button
          onClick={onMarkSpeaker}
          disabled={!isListening}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Mark New Speaker"
        >
          <UserPlusIcon className="w-5 h-5" />
          <span>New Speaker</span>
        </button>
      </div>

      <button
        onClick={onSummarize}
        disabled={isTranscriptEmpty || isSummarizing || isListening}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSummarizing ? (
          <>
            <LoadingIcon className="w-5 h-5 animate-spin" />
            Summarizing...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5" />
            Summarize Transcript
          </>
        )}
      </button>
    </div>
  );
};

export default ControlPanel;