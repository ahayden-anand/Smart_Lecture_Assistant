import React, { useState, useEffect } from 'react';
import { SpeakerWaveIcon, PlayIcon, StopIcon } from './Icons';

const TextToSpeechPanel: React.FC = () => {
    const [text, setText] = useState('');
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string | undefined>(undefined);
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        const loadVoices = () => {
            const systemVoices = window.speechSynthesis.getVoices();
            if (systemVoices.length > 0) {
                setVoices(systemVoices);
                const defaultVoice = systemVoices.find(v => v.default);
                setSelectedVoice(defaultVoice ? defaultVoice.voiceURI : systemVoices[0].voiceURI);
            }
        };
        loadVoices();
        // Voices may load asynchronously
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => {
             window.speechSynthesis.onvoiceschanged = null;
        }
    }, []);

    const handleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        if (text.trim() === '') return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = voices.find(v => v.voiceURI === selectedVoice);
        if (voice) {
            utterance.voice = voice;
        }
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="flex flex-col h-full p-4 space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-semibold text-[var(--accent-text-color)] flex items-center justify-center gap-2">
                    <SpeakerWaveIcon className="w-6 h-6" />
                    Text to Speech
                </h3>
                <p className="text-[var(--text-color-secondary)] text-sm mt-1">
                    Type your message and have it spoken aloud.
                </p>
            </div>
            
            <div className="flex-grow flex flex-col space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text to be spoken..."
                    className="w-full flex-grow bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    disabled={isSpeaking}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="voice-select" className="block text-sm font-medium text-[var(--text-color-secondary)] mb-1">Voice</label>
                        <select
                            id="voice-select"
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={voices.length === 0}
                        >
                            {voices.map(voice => (
                                <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="rate-slider" className="block text-sm font-medium text-[var(--text-color-secondary)] mb-1">Rate: {rate.toFixed(1)}</label>
                        <input id="rate-slider" type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                    </div>
                     <div>
                        <label htmlFor="pitch-slider" className="block text-sm font-medium text-[var(--text-color-secondary)] mb-1">Pitch: {pitch.toFixed(1)}</label>
                        <input id="pitch-slider" type="range" min="0" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                    </div>
                </div>
            </div>
            
            <button
                onClick={handleSpeak}
                disabled={!text.trim() && !isSpeaking}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSpeaking ? 'bg-red-600 hover:bg-red-500' : 'bg-[var(--accent-color)] hover:opacity-80'
                }`}
            >
                {isSpeaking ? (
                    <>
                        <StopIcon className="w-6 h-6" />
                        <span>Stop Speaking</span>
                    </>
                ) : (
                    <>
                        <PlayIcon className="w-6 h-6" />
                        <span>Speak</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default TextToSpeechPanel;