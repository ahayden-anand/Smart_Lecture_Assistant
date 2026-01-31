import React, { useState } from 'react';
import { useSingleUtteranceRecognition } from '../hooks/useSingleUtteranceRecognition';
import { MicIcon, PaperAirplaneIcon, StopCircleIcon, LoadingIcon } from './Icons';

interface VoiceQAPanelProps {
    onSendMessage: (message: string) => void;
    isChatting: boolean;
}

const VoiceQAPanel: React.FC<VoiceQAPanelProps> = ({ onSendMessage, isChatting }) => {
    const {
        isListening,
        transcript,
        setTranscript,
        start,
        stop,
        error: recognitionError
    } = useSingleUtteranceRecognition();

    const handleSend = () => {
        if (transcript.trim() && !isChatting) {
            onSendMessage(transcript.trim());
            setTranscript('');
        }
    };

    return (
        <div className="flex flex-col h-full items-center justify-center text-center p-4">
            <h3 className="text-lg font-semibold text-[var(--accent-text-color)] mb-2">Voice Q&A</h3>
            <p className="text-[var(--text-color-secondary)] mb-6 max-w-md">
                Press the microphone button and ask a question about the lecture transcript. The AI will answer in the main Q&A tab.
            </p>

            <div className="w-full max-w-lg space-y-4">
                <div className="relative w-full">
                    <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Your transcribed question will appear here..."}
                        className="w-full h-28 bg-gray-700 border border-gray-600 text-white rounded-lg p-3 pr-20 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                        readOnly={isListening}
                    />
                    <button
                        onClick={isListening ? stop : start}
                        className={`absolute top-1/2 right-4 -translate-y-1/2 p-3 rounded-full transition-colors duration-200 ${
                            isListening
                                ? 'bg-red-600 text-white animate-pulse'
                                : 'bg-[var(--accent-color)] text-white hover:opacity-80'
                        }`}
                        aria-label={isListening ? 'Stop recording' : 'Start recording'}
                    >
                        {isListening ? <StopCircleIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
                    </button>
                </div>

                {recognitionError && <p className="text-red-400 text-sm">{recognitionError}</p>}

                <button
                    onClick={handleSend}
                    disabled={!transcript.trim() || isChatting || isListening}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isChatting ? (
                        <>
                            <LoadingIcon className="w-5 h-5 animate-spin" />
                            <span>Waiting for answer...</span>
                        </>
                    ) : (
                        <>
                            <PaperAirplaneIcon className="w-5 h-5" />
                            <span>Ask Question</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default VoiceQAPanel;