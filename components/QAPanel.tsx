import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { LoadingIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from './Icons';

interface QAPanelProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isChatting: boolean;
  isTranscriptEmpty: boolean;
}

const QAPanel: React.FC<QAPanelProps> = ({
  chatHistory,
  onSendMessage,
  isChatting,
  isTranscriptEmpty,
}) => {
  const [input, setInput] = React.useState('');
  const endOfMessagesRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isChatting) {
      onSendMessage(input.trim());
      setInput('');
    }
  };
  
  if (isTranscriptEmpty) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
              <ChatBubbleLeftRightIcon className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold">Start a Conversation</h3>
              <p>Once you have a transcript, you can ask questions about it here.</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto space-y-6 pr-2">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center font-bold text-sm">AI</div>
            )}
            <div
              className={`max-w-md p-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white rounded-br-none'
                  : 'bg-gray-700 text-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
         {isChatting && (
            <div className="flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center font-bold text-sm">AI</div>
                 <div className="max-w-md p-3 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                     <LoadingIcon className="w-5 h-5 animate-spin text-gray-400" />
                 </div>
            </div>
         )}
        <div ref={endOfMessagesRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-6 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the transcript..."
          className="flex-grow bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
          disabled={isChatting}
        />
        <button
          type="submit"
          disabled={!input.trim() || isChatting}
          className="flex-shrink-0 flex items-center justify-center p-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default QAPanel;
