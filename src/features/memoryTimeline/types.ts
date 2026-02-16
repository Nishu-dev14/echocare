/**
 * Memory Timeline Data Types
 */

export interface MemoryNote {
  id: string;
  userId: string;
  text: string;
  audioUrl?: string;
  createdAt: string; // ISO timestamp
  dateKey: string; // Format: YYYY-MM-DD
}

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt?: string; // ISO timestamp
}

export interface TimelineItem {
  id: string;
  type: "task" | "note";
  title: string;
  description?: string;
  timestamp: string; // ISO timestamp for sorting
  status?: "completed" | "skipped" | "pending";
  category?: string;
}

export interface DailySummary {
  totalTasks: number;
  completedCount: number;
  skippedCount: number;
  pendingCount: number;
  noteCount: number;
}
