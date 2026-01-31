import React, { useMemo } from 'react';
import { TranscriptLine, Tone } from '../types';
import { LightBulbIcon, QuestionMarkCircleIcon, ExclamationCircleIcon, FaceSmileIcon, ChatBubbleBottomCenterTextIcon } from './Icons';

interface ContextPanelProps {
  transcript: TranscriptLine[];
}

const ToneIcon: React.FC<{ tone: Tone, className?: string }> = ({ tone, className = "w-5 h-5" }) => {
    switch (tone) {
        case 'question':
            return <QuestionMarkCircleIcon className={`${className} text-sky-400`}><title>Question</title></QuestionMarkCircleIcon>;
        case 'emphasis':
            return <ExclamationCircleIcon className={`${className} text-amber-400`}><title>Emphasis</title></ExclamationCircleIcon>;
        case 'humorous':
            return <FaceSmileIcon className={`${className} text-lime-400`}><title>Humorous</title></FaceSmileIcon>;
        case 'serious':
            return <ChatBubbleBottomCenterTextIcon className={`${className} text-gray-400`}><title>Serious</title></ChatBubbleBottomCenterTextIcon>;
        default:
            return null;
    }
}

const toneLabels: Record<Tone, string> = {
    question: "Question",
    emphasis: "Emphasis",
    humorous: "Humorous",
    serious: "Serious",
    neutral: "Neutral",
};

const ContextPanel: React.FC<ContextPanelProps> = ({ transcript }) => {
    const tonedLines = useMemo(() =>
        transcript.filter(line => line.isFinal && line.tone && line.tone !== 'neutral'),
        [transcript]
    );

    const toneDistribution = useMemo(() => {
        const counts = transcript
            .filter(line => line.isFinal && line.tone)
            .reduce((acc, line) => {
                if(line.tone) acc[line.tone] = (acc[line.tone] || 0) + 1;
                return acc;
            }, {} as Record<Tone, number>);
        
        const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

        if (total === 0) return [];
        
        return (Object.keys(counts) as Tone[])
            .filter(tone => tone !== 'neutral')
            .map(tone => ({
                tone,
                count: counts[tone],
                percentage: (counts[tone] / total) * 100,
            }))
            .sort((a, b) => b.count - a.count);

    }, [transcript]);


  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[var(--accent-text-color)] flex items-center gap-2">
            <LightBulbIcon className="w-6 h-6" />
            Context & Tone Analysis
        </h3>
        <p className="text-[var(--text-color-secondary)] text-sm mt-1">
            Visualizing the non-verbal cues from the lecture.
        </p>
      </div>

      {/* Tone Distribution */}
      <div className="space-y-3">
        <h4 className="font-semibold text-[var(--text-color-primary)]">Tone Distribution</h4>
        {toneDistribution.length > 0 ? (
            <div className="space-y-2">
                {toneDistribution.map(({ tone, percentage }) => (
                    <div key={tone} className="flex items-center gap-2">
                         <div className="w-6 flex justify-center items-center">
                            <ToneIcon tone={tone} className="w-5 h-5" />
                        </div>
                        <span className="w-20 text-sm text-[var(--text-color-secondary)]">{toneLabels[tone]}</span>
                        <div className="flex-grow bg-gray-700 rounded-full h-2.5">
                            <div className="bg-[var(--accent-color)] h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="text-sm font-mono text-[var(--text-color-secondary)]">{Math.round(percentage)}%</span>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-sm text-center text-gray-500 py-4">No significant tones detected yet.</p>
        )}
      </div>
      
      {/* Tone Log */}
      <div className="flex flex-col flex-grow min-h-0">
        <h4 className="font-semibold text-[var(--text-color-primary)] mb-3">Tone Log</h4>
        <div className="flex-grow overflow-y-auto space-y-3 pr-2 bg-gray-900/50 rounded-lg p-3">
            {tonedLines.length > 0 ? (
                tonedLines.map((line, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                        <ToneIcon tone={line.tone!} />
                        <span className="font-mono text-[var(--accent-text-color)]">{line.timestamp}</span>
                        <p className="text-[var(--text-color-secondary)] flex-1">"{line.text}"</p>
                    </div>
                ))
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    <p>Key moments will be logged here.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ContextPanel;