import { useState, useRef, useCallback } from 'react';

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSingleUtteranceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any | null>(null);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      // onend will handle setting isListening to false
    }
  }, []);

  const start = useCallback(() => {
    if (isListening || !SpeechRecognitionAPI) {
      if (!SpeechRecognitionAPI) {
        setError("Speech recognition is not supported in this browser.");
      }
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(final || interim);
    };

    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    
    setTranscript('');
    setError(null);
    recognitionRef.current = recognition;
    try {
        recognition.start();
        setIsListening(true);
    } catch (e) {
        setError("Could not start listening. Please check microphone permissions.");
        console.error("Error starting single utterance recognition:", e);
    }
  }, [isListening]);

  return { isListening, transcript, setTranscript, start, stop, error };
};
