import React, { useState, useCallback } from 'react';
import { SummaryData, TranscriptLine, ChatMessage } from '../types';
import { generateMarkdown, generateHtml } from '../utils/formatter';
import { DownloadIcon, TranslateIcon, LoadingIcon, DocumentTextIcon } from './Icons';

interface ExportPanelProps {
  transcript: TranscriptLine[];
  summary: SummaryData | null;
  chatHistory: ChatMessage[];
  onTranslate: (language: string) => void;
  isTranslating: boolean;
  translatedText: string | null;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  transcript,
  summary,
  chatHistory,
  onTranslate,
  isTranslating,
  translatedText,
}) => {
  const [targetLanguage, setTargetLanguage] = useState('Spanish');

  const handleExport = useCallback((format: 'md' | 'html') => {
    if (transcript.length === 0 && !summary) {
      alert('Nothing to export.');
      return;
    }

    let content = '';
    let blobType = '';
    let fileExtension = '';

    if (format === 'md') {
      content = generateMarkdown({ transcript, summary, chatHistory });
      blobType = 'text/markdown;charset=utf-8';
      fileExtension = 'md';
    } else {
      content = generateHtml({ transcript, summary, chatHistory });
      blobType = 'text/html;charset=utf-8';
      fileExtension = 'html';
    }

    const blob = new Blob([content], { type: blobType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `lecture_notes_${date}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [transcript, summary, chatHistory]);

  const handleTranslateClick = () => {
    onTranslate(targetLanguage);
  };

  const languages = ['Spanish', 'French', 'German', 'Japanese', 'Hindi', 'Mandarin Chinese'];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[var(--accent-text-color)]">Export & Translate</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleExport('html')}
          disabled={transcript.length === 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DocumentTextIcon className="w-5 h-5" />
          Export as Rich Text
        </button>
        <button
          onClick={() => handleExport('md')}
          disabled={transcript.length === 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DownloadIcon className="w-5 h-5" />
          Export to Markdown
        </button>
      </div>

      {/* Translation Section */}
      <div className="border-t border-[var(--border-color)] pt-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="flex-grow bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
          <button
            onClick={handleTranslateClick}
            disabled={transcript.length === 0 || isTranslating}
            className="flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranslating ? (
              <>
                <LoadingIcon className="w-5 h-5 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <TranslateIcon className="w-5 h-5" />
                Translate
              </>
            )}
          </button>
        </div>
      </div>

      {translatedText && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <h4 className="font-semibold text-gray-300 mb-2">Translation to {targetLanguage}:</h4>
          <p className="text-gray-400 whitespace-pre-wrap">{translatedText}</p>
        </div>
      )}
    </div>
  );
};

export default ExportPanel;