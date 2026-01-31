import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { summarizeTranscript, translateTranscript, extractTopics, createChat, analyzeTone } from './services/geminiService';
import { SummaryData, TranscriptLine, Topic, ChatMessage, Tone } from './types';
import { Chat } from '@google/genai';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import TranscriptDisplay from './components/TranscriptDisplay';
import SummaryDisplay from './components/SummaryDisplay';
import ExportPanel from './components/ExportPanel';
import Tabs from './components/Tabs';
import TopicTracker from './components/TopicTracker';
import QAPanel from './components/QAPanel';
import ContextPanel from './components/ContextPanel';
import VoiceQAPanel from './components/VoiceQAPanel';
import TextToSpeechPanel from './components/TextToSpeechPanel';
import { SparklesIcon, ChatBubbleLeftRightIcon, LightBulbIcon, MicIcon, SpeakerWaveIcon } from './components/Icons';
import { transcriptToPlainText, formatTimestamp } from './utils/formatter';
import AudioVisualizer from './components/AudioVisualizer';
import AccessibilityPanel from './components/AccessibilityPanel';

const App: React.FC = () => {
  const {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    error: speechError,
  } = useSpeechRecognition();

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // New state for innovative features
  const [activeTab, setActiveTab] = useState('analysis');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isExtractingTopics, setIsExtractingTopics] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const lastAnalyzedLength = useRef(0);
  
  // State for accessibility and visual features
  const [speakerCount, setSpeakerCount] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [newTopicTrigger, setNewTopicTrigger] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  const handleFontSizeChange = (size: string) => {
    document.documentElement.style.setProperty('--transcript-font-size', size);
  };
  
  const handleMarkSpeaker = useCallback(() => {
    const newSpeakerCount = speakerCount + 1;
    setSpeakerCount(newSpeakerCount);
    // Add a marker to the transcript
    setTranscript(prev => [...prev, {
        text: `--- Switched to Speaker ${newSpeakerCount} ---`,
        timestamp: formatTimestamp(new Date()),
        isFinal: true,
        speakerId: newSpeakerCount,
        isMarker: true,
    }]);
  }, [speakerCount, setTranscript]);

  const plainTranscript = useMemo(() => transcriptToPlainText(transcript), [transcript]);

  const handleSummarize = useCallback(async () => {
    if (!plainTranscript || isSummarizing) return;
    setIsSummarizing(true);
    setGeminiError(null);
    setSummary(null);
    try {
      const result = await summarizeTranscript(plainTranscript);
      setSummary(result);
    } catch (e) {
      console.error(e);
      setGeminiError('Failed to generate summary. Please check your API key and try again.');
    } finally {
      setIsSummarizing(false);
    }
  }, [plainTranscript, isSummarizing]);
  
  const handleTranslate = useCallback(async (language: string) => {
    if (!plainTranscript || isTranslating) return;
    setIsTranslating(true);
    setGeminiError(null);
    setTranslatedText(null);
    try {
      const result = await translateTranscript(plainTranscript, language);
      setTranslatedText(result);
    } catch (e) {
      console.error(e);
      setGeminiError(`Failed to translate to ${language}. Please check your API key and try again.`);
    } finally {
      setIsTranslating(false);
    }
  }, [plainTranscript, isTranslating]);

  // Effect for live topic extraction
  useEffect(() => {
    const wordCount = plainTranscript.split(/\s+/).filter(Boolean).length;
    const MIN_WORD_INCREASE = 50;

    if (isListening && wordCount > lastAnalyzedLength.current + MIN_WORD_INCREASE) {
      const handleExtractTopics = async () => {
        setIsExtractingTopics(true);
        try {
          const newTopicNames = await extractTopics(plainTranscript);
          
          const currentTopicNames = new Set(topics.map(t => t.name.toLowerCase()));
          const uniqueNewTopics: Topic[] = newTopicNames
            .filter(name => !currentTopicNames.has(name.toLowerCase()))
            .map(name => ({ name, timestamp: formatTimestamp(new Date()) }));

          if (uniqueNewTopics.length > 0) {
            setTopics(prev => [...prev, ...uniqueNewTopics]);
            setNewTopicTrigger(prev => prev + 1); // Trigger animation
          }
        } catch (e) {
          console.error("Failed to extract topics:", e);
        } finally {
          setIsExtractingTopics(false);
        }
      };
      
      handleExtractTopics();
      lastAnalyzedLength.current = wordCount;
    }
  }, [plainTranscript, isListening, topics]);
  
  // Effect for live tone analysis
  useEffect(() => {
      const lastLine = transcript[transcript.length - 1];
      if (lastLine && lastLine.isFinal && !lastLine.tone && !lastLine.isMarker) {
          const analyze = async () => {
              try {
                  const tone = await analyzeTone(lastLine.text);
                  setTranscript(prev => {
                      const newTranscript = [...prev];
                      const targetIndex = newTranscript.findIndex(line => line.timestamp === lastLine.timestamp && line.text === lastLine.text);
                      if (targetIndex !== -1) {
                        newTranscript[targetIndex] = { ...newTranscript[targetIndex], tone };
                      }
                      return newTranscript;
                  });
              } catch (e) {
                  console.error("Failed to analyze tone", e);
              }
          };
          analyze();
      }
  }, [transcript, setTranscript]);

  const handleSendMessage = useCallback(async (message: string) => {
      if (!plainTranscript || isChatting) return;
      setIsChatting(true);
      setGeminiError(null);
      // Switch to the Q&A tab to show the conversation
      setActiveTab('qna');
      setChatHistory(prev => [...prev, { role: 'user', content: message }]);
      try {
          if (!chatRef.current) {
              chatRef.current = createChat(plainTranscript);
          }
          const response = await chatRef.current.sendMessage({ message });
          
          setChatHistory(prev => [...prev, { role: 'model', content: response.text }]);
      } catch(e) {
          console.error("Chat error:", e);
          setGeminiError("An error occurred during the chat. Please try again.");
          setChatHistory(prev => prev.slice(0, prev.length -1));
      } finally {
          setIsChatting(false);
      }
  }, [plainTranscript, isChatting]);


  const tabs = [
    { id: 'analysis', label: 'Analysis', icon: <SparklesIcon className="w-5 h-5" /> },
    { id: 'qna', label: 'Q&A', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
    { id: 'voice-qna', label: 'Voice Q&A', icon: <MicIcon className="w-5 h-5" /> },
    { id: 'tts', label: 'Text to Speech', icon: <SpeakerWaveIcon className="w-5 h-5" /> },
    { id: 'context', label: 'Context & Tone', icon: <LightBulbIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color-primary)] font-sans flex flex-col transition-colors duration-300">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Transcription */}
        <div className="flex flex-col bg-[var(--panel-bg-color)] rounded-2xl shadow-lg ring-1 ring-white/10 overflow-hidden">
          <div className="p-6 border-b border-[var(--border-color)] flex-shrink-0">
            <h2 className="text-2xl font-bold text-white">Live Transcription</h2>
            <p className="text-[var(--text-color-secondary)] mt-1">Visualizing the soundscape of your lecture.</p>
          </div>
          <ControlPanel
            isListening={isListening}
            isTranscriptEmpty={transcript.length === 0}
            onStart={startListening}
            onStop={stopListening}
            onSummarize={handleSummarize}
            isSummarizing={isSummarizing}
            onMarkSpeaker={handleMarkSpeaker}
          />
          <AudioVisualizer isListening={isListening} />
          {speechError && <div className="p-4 mx-6 mb-4 text-center text-red-400 bg-red-900/50 rounded-lg flex-shrink-0">{speechError}</div>}
          <TranscriptDisplay transcript={transcript} />
        </div>

        {/* Right Column: Analysis & Notes */}
        <div className="flex flex-col bg-[var(--panel-bg-color)] rounded-2xl shadow-lg ring-1 ring-white/10 overflow-hidden">
          <div className="p-6 border-b border-[var(--border-color)] flex-shrink-0">
            <h2 className="text-2xl font-bold text-white">AI Analysis & Notes</h2>
            <p className="text-[var(--text-color-secondary)] mt-1">Generate summaries, track topics, and ask questions.</p>
          </div>
          
          <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
          
          <div className="flex-grow p-6 overflow-y-auto">
             {geminiError && <div className="p-4 mb-4 text-center text-red-400 bg-red-900/50 rounded-lg">{geminiError}</div>}
            
            {activeTab === 'analysis' && (
                <>
                    <SummaryDisplay summary={summary} isLoading={isSummarizing} />
                    <TopicTracker topics={topics} isLoading={isExtractingTopics} newTopicTrigger={newTopicTrigger} />
                </>
            )}

            {activeTab === 'qna' && (
                <div className="h-full">
                    <QAPanel
                        chatHistory={chatHistory}
                        onSendMessage={handleSendMessage}
                        isChatting={isChatting}
                        isTranscriptEmpty={transcript.length === 0}
                    />
                </div>
            )}

            {activeTab === 'voice-qna' && (
                <div className="h-full">
                    <VoiceQAPanel
                        onSendMessage={handleSendMessage}
                        isChatting={isChatting}
                    />
                </div>
            )}

            {activeTab === 'tts' && (
                <div className="h-full">
                    <TextToSpeechPanel />
                </div>
            )}

            {activeTab === 'context' && (
                <div className="h-full">
                    <ContextPanel transcript={transcript} />
                </div>
            )}
          </div>
          
          <div className="p-6 border-t border-[var(--border-color)] flex-shrink-0">
             <ExportPanel
              transcript={transcript}
              summary={summary}
              chatHistory={chatHistory}
              onTranslate={handleTranslate}
              isTranslating={isTranslating}
              translatedText={translatedText}
             />
          </div>
        </div>
      </main>
      <AccessibilityPanel
        onFontSizeChange={handleFontSizeChange}
        onHighContrastToggle={setHighContrast}
        highContrast={highContrast}
      />
    </div>
  );
};

export default App;