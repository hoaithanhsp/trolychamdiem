export interface Student {
  id: string;
  name: string;
  classId: string;
  dateOfBirth?: string; // Format DD/MM/YYYY or YYYY-MM-DD
}

export interface Class {
  id: string;
  name: string;
  grade: number; // 6, 7, 8, 9, 10, 11, 12
  teacher: string; // GVCN
  studentCount: number;
}

export type RecordType = 'violation' | 'reward';

export interface ScoreRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; // ISO Date String YYYY-MM-DD
  type: RecordType;
  category: string; // e.g., "Đi học muộn"
  points: number; // Negative for violation, Positive for reward
  note?: string;
  timestamp: number;
}

export interface Category {
  id: string;
  name: string;
  points: number; // Absolute value usually, but config defines sign
  type: RecordType;
}

export interface AppData {
  classes: Class[];
  students: Student[];
  records: ScoreRecord[];
  categories: Category[];
}

export type ViewState = 'dashboard' | 'classes' | 'scoring' | 'reports' | 'settings';