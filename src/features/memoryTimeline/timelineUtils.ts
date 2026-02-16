/**
 * Timeline Utility Functions
 */

import { Task, MemoryNote, TimelineItem, DailySummary } from './types';

/**
 * Convert a Date to YYYY-MM-DD format
 */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format timestamp to readable time (HH:MM AM/PM)
 */
export const formatTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

/**
 * Get tasks for a specific date from localStorage
 */
export const getTasksByDate = (dateKey: string): Task[] => {
  try {
    const allTasks = localStorage.getItem('tasks');
    if (!allTasks) return [];

    const tasks: Task[] = JSON.parse(allTasks);
    
    // Filter tasks by date
    return tasks.filter((task) => {
      if (!task.createdAt) return false;
      const taskDateKey = formatDateKey(new Date(task.createdAt));
      return taskDateKey === dateKey;
    });
  } catch {
    return [];
  }
};

/**
 * Get memory notes for a specific date from localStorage
 */
export const getMemoryNotesByDate = (dateKey: string): MemoryNote[] => {
  try {
    const allNotes = localStorage.getItem('memoryNotes');
    if (!allNotes) return [];

    const notes: MemoryNote[] = JSON.parse(allNotes);
    return notes.filter((note) => note.dateKey === dateKey);
  } catch {
    return [];
  }
};

/**
 * Convert Task to TimelineItem
 */
export const taskToTimelineItem = (task: Task): TimelineItem => {
  // Determine status based on completed flag and a potential skipped marker
  let status: 'completed' | 'skipped' | 'pending' = 'pending';
  if (task.completed) {
    status = 'completed';
  }

  return {
    id: `task-${task.id}`,
    type: 'task',
    title: task.text,
    timestamp: task.createdAt || new Date().toISOString(),
    status,
  };
};

/**
 * Convert MemoryNote to TimelineItem
 */
export const noteToTimelineItem = (note: MemoryNote): TimelineItem => {
  return {
    id: `note-${note.id}`,
    type: 'note',
    title: 'Memory Note',
    description: note.text,
    timestamp: note.createdAt,
    category: 'Memory',
  };
};

/**
 * Get all timeline items for a specific date, sorted by time
 */
export const getTimelineItemsByDate = (dateKey: string): TimelineItem[] => {
  const tasks = getTasksByDate(dateKey);
  const notes = getMemoryNotesByDate(dateKey);

  const timelineItems: TimelineItem[] = [
    ...tasks.map(taskToTimelineItem),
    ...notes.map(noteToTimelineItem),
  ];

  // Sort by timestamp (ascending order)
  timelineItems.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeA - timeB;
  });

  return timelineItems;
};

/**
 * Calculate daily summary statistics
 */
export const calculateDailySummary = (items: TimelineItem[]): DailySummary => {
  const tasks = items.filter((item) => item.type === 'task');
  const notes = items.filter((item) => item.type === 'note');

  const completedCount = tasks.filter(
    (task) => task.status === 'completed'
  ).length;
  const skippedCount = tasks.filter((task) => task.status === 'skipped').length;
  const pendingCount = tasks.filter((task) => task.status === 'pending').length;

  return {
    totalTasks: tasks.length,
    completedCount,
    skippedCount,
    pendingCount,
    noteCount: notes.length,
  };
};

/**
 * Save memory note to localStorage
 */
export const saveMemoryNote = (note: Omit<MemoryNote, 'id'>): MemoryNote => {
  const fullNote: MemoryNote = {
    ...note,
    id: `note-${Date.now()}-${Math.random()}`,
  };

  try {
    const existing = localStorage.getItem('memoryNotes');
    const notes = existing ? JSON.parse(existing) : [];
    notes.push(fullNote);
    localStorage.setItem('memoryNotes', JSON.stringify(notes));
    return fullNote;
  } catch {
    console.error('Failed to save memory note');
    return fullNote;
  }
};

/**
 * Update task completion status
 */
export const updateTaskStatus = (
  taskId: number,
  completed: boolean
): void => {
  try {
    const tasksJson = localStorage.getItem('tasks');
    if (!tasksJson) return;

    const tasks: Task[] = JSON.parse(tasksJson);
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    
    if (taskIndex !== -1) {
      tasks[taskIndex].completed = completed;
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  } catch {
    console.error('Failed to update task status');
  }
};
