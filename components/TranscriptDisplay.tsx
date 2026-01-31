import React, { useRef, useEffect } from 'react';
import { TranscriptLine } from '../types';
import { QuestionMarkCircleIcon, ExclamationCircleIcon, FaceSmileIcon, ChatBubbleBottomCenterTextIcon } from './Icons';

interface TranscriptDisplayProps {
  transcript: TranscriptLine[];
}

const ToneIcon: React.FC<{ tone: TranscriptLine['tone'] }> = ({ tone }) => {
    switch (tone) {
        case 'question':
            return <QuestionMarkCircleIcon className="w-5 h-5 text-sky-400 flex-shrink-0"><title>Question</title></QuestionMarkCircleIcon>;
        case 'emphasis':
            return <ExclamationCircleIcon className="w-5 h-5 text-amber-400 flex-shrink-0"><title>Emphasis</title></ExclamationCircleIcon>;
        case 'humorous':
            return <FaceSmileIcon className="w-5 h-5 text-lime-400 flex-shrink-0"><title>Humorous</title></FaceSmileIcon>;
        case 'serious':
            return <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-400 flex-shrink-0"><title>Serious</title></ChatBubbleBottomCenterTextIcon>;
        default:
            return <div className="w-5 h-5 flex-shrink-0" />;
    }
}


const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript }) => {
  const endOfTranscriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfTranscriptRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  return (
    <div className="flex-grow p-6 overflow-y-auto bg-gray-900/50 m-2 rounded-lg" style={{ fontSize: 'var(--transcript-font-size)'}}>
      {transcript.length === 0 ? (
        <div className="flex items-center justify-center h-full text-[var(--text-color-secondary)]">
          <p>Press "Start" to begin transcription...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transcript.map((line, index) => {
            if (line.isMarker) {
                return (
                    <div key={index} className="flex items-center gap-3 text-sm text-center justify-center text-indigo-400 font-semibold py-2">
                        <span>{line.text}</span>
                    </div>
                )
            }
            return (
                <div key={index} className="flex items-start gap-3">
                  <ToneIcon tone={line.tone} />
                  <span className="font-mono text-sm text-[var(--accent-color)] mt-1 whitespace-nowrap">{line.timestamp}</span>
                  {line.speakerId && <span className="font-semibold text-sm text-gray-400 mt-1">[S{line.speakerId}]</span>}
                  <p className={`leading-relaxed ${line.isFinal ? 'text-[var(--text-color-primary)] font-medium' : 'text-[var(--text-color-secondary)] italic'}`}>
                    {line.text}
                  </p>
                </div>
              )
          })}
          <div ref={endOfTranscriptRef} />
        </div>
      )}
    </div>
  );
};

export default TranscriptDisplay;