import { useState, useRef, useCallback, useEffect } from 'react';
import { TranscriptLine } from '../types';
import { formatTimestamp } from '../utils/formatter';

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any | null>(null);
  const currentSpeakerId = useRef(1);

  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      const newFinalLines: TranscriptLine[] = [];

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinalLines.push({
            text: transcriptPart.trim(),
            timestamp: formatTimestamp(new Date()),
            isFinal: true,
            speakerId: currentSpeakerId.current,
          });
        } else {
          interimTranscript += transcriptPart;
        }
      }
      
      setTranscript(prev => {
        let updatedTranscript = [...prev];
        const last = updatedTranscript[updatedTranscript.length - 1];

        // If the last item was interim, remove it before processing new results
        if (last && !last.isFinal) {
            updatedTranscript.pop();
        }

        // Add all new final results
        updatedTranscript.push(...newFinalLines);

        // Add or update the interim result
        if (interimTranscript.trim()) {
            updatedTranscript.push({
                text: interimTranscript.trim(),
                timestamp: formatTimestamp(new Date()),
                isFinal: false,
                speakerId: currentSpeakerId.current,
            });
        }
        return updatedTranscript;
      });
    };

    recognition.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
            setError(`Error: ${event.error}. Please check your microphone and try again.`);
        } else {
            setError(`Speech recognition error: ${event.error}`);
        }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
          // It might have stopped unexpectedly, try to restart it
          try {
              recognitionRef.current?.start();
          } catch(e) {
              console.error("Could not restart listening:", e);
              setIsListening(false);
          }
      } else {
          setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
        recognitionRef.current?.stop();
    };

  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript([]); // Clear previous transcript on start
        currentSpeakerId.current = 1; // Reset speaker
        setError(null);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setError("Could not start speech recognition. It might be already active.");
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      setIsListening(false); // Set state first to prevent auto-restart in onend
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return { isListening, transcript, setTranscript, error, startListening, stopListening };
};