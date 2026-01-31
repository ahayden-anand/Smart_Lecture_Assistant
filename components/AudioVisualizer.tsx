
import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  isListening: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isListening }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // FIX: Provided an initial value to useRef to fix the "Expected 1 arguments, but got 0" error.
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;

      const canvasCtx = canvas.getContext('2d');
      if (!canvasCtx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgba(31, 41, 55, 0.5)'; // bg-gray-800/50
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      
      canvasCtx.lineWidth = 2;
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#4F46E5';
      canvasCtx.strokeStyle = accentColor;
      
      canvasCtx.beginPath();
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
      
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    const startVisualizer = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        streamRef.current = stream;
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;
        
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;

        source.connect(analyser);
        draw();
      } catch (err) {
        console.error('Error accessing microphone for visualizer:', err);
      }
    };

    const stopVisualizer = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      const canvas = canvasRef.current;
      const canvasCtx = canvas?.getContext('2d');
      if (canvas && canvasCtx) {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    if (isListening) {
      startVisualizer();
    } else {
      stopVisualizer();
    }

    return () => {
      stopVisualizer();
    };
  }, [isListening]);

  return <canvas ref={canvasRef} width="600" height="100" className="w-full h-24 rounded-lg bg-gray-800/50 mx-auto block mb-4"></canvas>;
};

export default AudioVisualizer;
