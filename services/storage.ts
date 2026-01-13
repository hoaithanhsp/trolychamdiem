import { AppData, ScoreRecord, Class, Student, Category } from '../types';
import { DEFAULT_CATEGORIES, generateMockData } from '../constants';

const STORAGE_KEY = 'flagmaster_data_v1';

export const getStorageData = (): AppData => {
  const dataStr = localStorage.getItem(STORAGE_KEY);
  if (dataStr) {
    return JSON.parse(dataStr);
  }

  // Initialize with mock data if first run
  const { classes, students } = generateMockData();
  const initialData: AppData = {
    classes,
    students,
    records: [],
    categories: DEFAULT_CATEGORIES,
  };
  saveStorageData(initialData);
  return initialData;
};

export const saveStorageData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addRecord = (record: Omit<ScoreRecord, 'id' | 'timestamp'>) => {
  const data = getStorageData();
  const newRecord: ScoreRecord = {
    ...record,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  data.records.push(newRecord);
  saveStorageData(data);
  return newRecord;
};

export const deleteRecord = (recordId: string) => {
  const data = getStorageData();
  data.records = data.records.filter((r) => r.id !== recordId);
  saveStorageData(data);
};

export const resetSemester = () => {
  const data = getStorageData();
  data.records = []; // Clear all scores
  saveStorageData(data);
};

// Helper for exporting
export const exportData = () => {
  const data = getStorageData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FlagMaster_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
