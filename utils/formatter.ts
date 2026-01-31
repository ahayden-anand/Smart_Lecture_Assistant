import { TranscriptLine, SummaryData, ChatMessage } from '../types';

export const formatTimestamp = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `[${hours}:${minutes}:${seconds}]`;
};

export const transcriptToPlainText = (transcript: TranscriptLine[]): string => {
  return transcript
    .filter(line => line.isFinal && !line.isMarker)
    .map(line => line.text)
    .join(' ');
};

interface ExportData {
  transcript: TranscriptLine[];
  summary: SummaryData | null;
  chatHistory?: ChatMessage[];
  title?: string;
}

export const generateMarkdown = ({
  transcript,
  summary,
  chatHistory,
  title,
}: ExportData): string => {
  const today = new Date().toISOString().split('T')[0];
  let md = `# ${title || `Lecture Notes – ${today}`}\n\n`;

  if (summary) {
    md += '## AI Generated Summary\n\n';
    md += '### Summary\n';
    summary.summary.forEach(item => {
      md += `- ${item}\n`;
    });
    md += '\n';

    md += '### Key Terms & Definitions\n';
    summary.key_terms.forEach(item => {
      md += `- ${item}\n`;
    });
    md += '\n';

    md += '### Action Items\n';
    summary.action_items.forEach(item => {
      md += `- ${item}\n`;
    });
    md += '\n';
  }

  if (chatHistory && chatHistory.length > 0) {
      md += '## Q&A Session\n\n';
      chatHistory.forEach(msg => {
          const prefix = msg.role === 'user' ? '**You:**' : '**AI Assistant:**';
          const blockquotedContent = msg.content.split('\n').map(line => `> ${line}`).join('\n');
          md += `${prefix}\n${blockquotedContent}\n\n`;
      });
      md += '\n';
  }


  md += '## Full Transcript\n';
  transcript
    .filter(line => line.isFinal)
    .forEach(line => {
      if (line.isMarker) {
        md += `\n**${line.text}**\n\n`;
      } else {
        md += `${line.timestamp} [Speaker ${line.speakerId || 1}] ${line.text}\n`;
      }
    });

  return md;
};


export const generateHtml = ({
  transcript,
  summary,
  chatHistory,
  title,
}: ExportData): string => {
  const today = new Date().toISOString().split('T')[0];
  const docTitle = title || `Lecture Notes – ${today}`;

  const styles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
      h1, h2, h3 { color: #111; border-bottom: 1px solid #eee; padding-bottom: 10px; }
      h1 { font-size: 2.5em; }
      h2 { font-size: 2em; }
      h3 { font-size: 1.5em; }
      ul { padding-left: 20px; }
      li { margin-bottom: 8px; }
      .transcript-line { margin-bottom: 12px; }
      .timestamp { font-family: monospace; color: #4F46E5; font-weight: bold; }
      .speaker { font-weight: bold; color: #555; margin-right: 8px; }
      .marker { text-align: center; color: #4F46E5; font-style: italic; margin: 20px 0; font-weight: bold; }
      .chat-message { margin-bottom: 1em; }
      .chat-role { font-weight: bold; }
      .chat-content { background-color: #f5f5f5; border-radius: 8px; padding: 10px; margin-top: 4px; }
    </style>
  `;

  let body = `<h1>${docTitle}</h1>`;

  if (summary) {
    body += '<h2>AI Generated Summary</h2>';
    body += '<h3>Summary</h3><ul>';
    summary.summary.forEach(item => { body += `<li>${item}</li>`; });
    body += '</ul>';

    body += '<h3>Key Terms & Definitions</h3><ul>';
    summary.key_terms.forEach(item => { body += `<li>${item}</li>`; });
    body += '</ul>';

    body += '<h3>Action Items</h3><ul>';
    summary.action_items.forEach(item => { body += `<li>${item}</li>`; });
    body += '</ul>';
  }

  if (chatHistory && chatHistory.length > 0) {
    body += '<h2>Q&A Session</h2>';
    chatHistory.forEach(msg => {
      body += `<div class="chat-message">
        <div class="chat-role">${msg.role === 'user' ? 'You:' : 'AI Assistant:'}</div>
        <div class="chat-content">${msg.content.replace(/\n/g, '<br>')}</div>
      </div>`;
    });
  }

  body += '<h2>Full Transcript</h2>';
  transcript
    .filter(line => line.isFinal)
    .forEach(line => {
      if (line.isMarker) {
        body += `<div class="marker">${line.text}</div>`;
      } else {
        const toneStyle = line.tone === 'emphasis' ? 'font-weight: bold;' : (line.tone === 'question' ? 'font-style: italic;' : '');
        body += `<div class="transcript-line">
          <span class="timestamp">${line.timestamp}</span>
          <span class="speaker">[Speaker ${line.speakerId || 1}]</span>
          <span style="${toneStyle}">${line.text}</span>
        </div>`;
      }
    });

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${docTitle}</title>${styles}</head><body>${body}</body></html>`;
};