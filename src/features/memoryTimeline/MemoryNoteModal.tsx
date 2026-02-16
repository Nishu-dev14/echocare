/**
 * Memory Note Modal Component
 * Allows users to add text or voice-based memory notes
 */

import React, { useState, useRef, ChangeEvent } from 'react';
import { Mic, X, Send } from 'lucide-react';

interface MemoryNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string, audioUrl?: string) => void;
  dateKey: string;
}

export const MemoryNoteModal: React.FC<MemoryNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  dateKey,
}: MemoryNoteModalProps) => {
  const [noteText, setNoteText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  if (!isOpen) return null;

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev: number) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      setIsRecording(false);

      // Convert audio to blob URL
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Save audio URL temporarily for transcription
        // In a real app, you'd send this to a speech-to-text service
        console.log('Audio recorded:', audioUrl);
      };
    }
  };

  const handleSave = () => {
    if (noteText.trim() || isRecording === false) {
      onSave(noteText, undefined);
      setNoteText('');
      onClose();
    } else {
      alert('Please enter a note or record audio.');
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Add Memory Note</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Date display */}
        <p className="text-sm text-gray-600">
          Date: <span className="font-semibold">{dateKey}</span>
        </p>

        {/* Text input */}
        <textarea
          value={noteText}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNoteText(e.target.value)}
          placeholder="Write your memory note here... 💭"
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
          rows={4}
        />

        {/* Voice recording section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">
              Voice Recording
            </span>
            {isRecording && (
              <span className="text-xs font-mono bg-red-500 text-white px-2 py-1 rounded">
                {formatDuration(recordingDuration)}
              </span>
            )}
          </div>

          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Mic size={18} />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            <Send size={18} />
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryNoteModal;
