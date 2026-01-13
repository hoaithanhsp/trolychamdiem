import { Category, Class, Student } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'v1', name: 'Đi học muộn (<10p)', points: -0.5, type: 'violation' },
  { id: 'v2', name: 'Đi học muộn (>10p)', points: -1, type: 'violation' },
  { id: 'v3', name: 'Không mặc đồng phục', points: -1, type: 'violation' },
  { id: 'v4', name: 'Không làm bài tập', points: -2, type: 'violation' },
  { id: 'v5', name: 'Gây mất trật tự', points: -2, type: 'violation' },
  { id: 'v6', name: 'Sử dụng điện thoại', points: -5, type: 'violation' },
  { id: 'v7', name: 'Đánh nhau/Chửi thề', points: -10, type: 'violation' },
  
  { id: 'r1', name: 'Điểm tốt (9-10)', points: 1, type: 'reward' },
  { id: 'r2', name: 'Phát biểu xây dựng bài', points: 1, type: 'reward' },
  { id: 'r3', name: 'Nhặt được của rơi', points: 2, type: 'reward' },
  { id: 'r4', name: 'Tham gia hoạt động trường', points: 2, type: 'reward' },
  { id: 'r5', name: 'Đạt giải cấp trường', points: 5, type: 'reward' },
];

// Helper to generate mock data if empty
export const generateMockData = (): { classes: Class[], students: Student[] } => {
  const classes: Class[] = [];
  const students: Student[] = [];

  const classNames = ['10A1', '10A2', '10A3', '11B1', '11B2', '12C1'];
  
  classNames.forEach((name, index) => {
    const classId = `class-${index + 1}`;
    classes.push({
      id: classId,
      name: name,
      grade: parseInt(name.substring(0, 2)),
      teacher: `Nguyễn Văn ${String.fromCharCode(65 + index)}`, // A, B, C...
      studentCount: 40,
    });

    for (let i = 1; i <= 40; i++) {
      students.push({
        id: `stu-${classId}-${i}`,
        name: `Học sinh ${name} - ${i}`,
        classId: classId,
      });
    }
  });

  return { classes, students };
};
