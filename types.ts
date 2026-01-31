export interface TranscriptLine {
  text: string;
  timestamp: string;
  isFinal: boolean;
  speakerId?: number;
  tone?: Tone;
  isMarker?: boolean;
}

export interface SummaryData {
  summary: string[];
  key_terms: string[];
  action_items: string[];
}

export interface Topic {
  name: string;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export type Tone = 'question' | 'emphasis' | 'neutral' | 'humorous' | 'serious';