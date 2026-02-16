/**
 * Memory Timeline Component
 * Displays a chronological daily timeline of tasks, memory notes, and completed activities
 */

import React, { useState, useEffect, ReactNode } from 'react';
import {
  CheckCircle,
  XCircle,
  Circle,
  Mic,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import MemoryNoteModal from './MemoryNoteModal';
import {
  formatDateKey,
  formatTime,
  getTimelineItemsByDate,
  calculateDailySummary,
  saveMemoryNote,
} from './timelineUtils';
import { TimelineItem, DailySummary } from './types';

export const MemoryTimeline: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [summary, setSummary] = useState<DailySummary>({
    totalTasks: 0,
    completedCount: 0,
    skippedCount: 0,
    pendingCount: 0,
    noteCount: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load timeline data when date changes
  useEffect(() => {
    const dateKey = formatDateKey(selectedDate);
    const items = getTimelineItemsByDate(dateKey);
    setTimelineItems(items);
    setSummary(calculateDailySummary(items));
  }, [selectedDate]);

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleSaveNote = (text: string) => {
    const dateKey = formatDateKey(selectedDate);
    saveMemoryNote({
      userId: 'current-user', // In a real app, get from auth context
      text,
      createdAt: new Date().toISOString(),
      dateKey,
    });

    // Refresh timeline
    const items = getTimelineItemsByDate(dateKey);
    setTimelineItems(items);
    setSummary(calculateDailySummary(items));
    setIsModalOpen(false);
  };

  const getStatusIcon = (item: TimelineItem): ReactNode => {
    if (item.type === 'note') {
      return <Mic className="text-blue-500" size={24} />;
    }

    switch (item.status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'skipped':
        return <XCircle className="text-red-500" size={24} />;
      case 'pending':
        return <Circle className="text-yellow-400" size={24} />;
      default:
        return <Circle className="text-gray-400" size={24} />;
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'skipped':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const dateString = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hasActivities = timelineItems.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Your Memory Timeline 📅
          </h1>
          <p className="text-gray-600 text-lg">Replay your day whenever you need</p>
        </div>

        {/* Date Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousDay}
              className="bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-full transition transform hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="text-center flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {dateString}
              </h2>
            </div>

            <button
              onClick={handleNextDay}
              className="bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-full transition transform hover:scale-110"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Add Note Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            <Plus size={20} />
            Add Memory Note
          </button>
        </div>

        {/* Daily Summary Card */}
        {hasActivities && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Today's Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {summary.totalTasks}
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Activities</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {summary.completedCount}
                </p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                <p className="text-3xl font-bold text-red-600">
                  {summary.skippedCount}
                </p>
                <p className="text-sm text-gray-600 mt-1">Skipped</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">
                  {summary.pendingCount}
                </p>
                <p className="text-sm text-gray-600 mt-1">Pending</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">
                  {summary.noteCount}
                </p>
                <p className="text-sm text-gray-600 mt-1">Memory Notes</p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {hasActivities ? (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Timeline</h3>

            {timelineItems.map((item, index) => (
              <div key={item.id} className="flex gap-4">
                {/* Timeline line and dot */}
                <div className="flex flex-col items-center">
                  <div className="bg-white rounded-full p-2 shadow-md">
                    {getStatusIcon(item)}
                  </div>
                  {index !== timelineItems.length - 1 && (
                    <div className="w-1 h-16 bg-gradient-to-b from-indigo-300 to-indigo-100 mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-gray-600 text-sm mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.status && (
                        <span
                          className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadgeColor(
                            item.status
                          )}`}
                        >
                          {item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 font-mono">
                      {formatTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">💛</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              You haven't logged anything yet today
            </h3>
            <p className="text-gray-600 mb-4">
              Start by adding a memory note or check back later!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold inline-flex items-center gap-2 transition"
            >
              <Plus size={20} />
              Add Your First Memory Note
            </button>
          </div>
        )}
      </div>

      {/* Memory Note Modal */}
      <MemoryNoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        dateKey={formatDateKey(selectedDate)}
      />
    </div>
  );
};

export default MemoryTimeline;
