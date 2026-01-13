import React, { useState, useRef } from 'react';
import { AppData, Class, Student } from '../types';
import { Search, Plus, Trash2, Edit, ChevronDown, ChevronUp, UserPlus, FileSpreadsheet, X, Save, UploadCloud, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ClassManagerProps {
  data: AppData;
  onUpdate: (newData: AppData) => void;
}

const ClassManager: React.FC<ClassManagerProps> = ({ data, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<number | 'all'>('all');
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [classForm, setClassForm] = useState({ name: '', grade: 10, teacher: '' });

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({ name: '', dateOfBirth: '', classId: '' });

  // Derived state for filtered classes
  const filteredClasses = data.classes.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cls.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || cls.grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const toggleExpand = (id: string) => {
    setExpandedClassId(expandedClassId === id ? null : id);
  };

  // --- Class Operations ---

  const openAddClassModal = () => {
    setEditingClass(null);
    setClassForm({ name: '', grade: 10, teacher: '' });
    setShowClassModal(true);
  };

  const openEditClassModal = (cls: Class, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClass(cls);
    setClassForm({ name: cls.name, grade: cls.grade, teacher: cls.teacher });
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
        // Edit
        const updatedClasses = data.classes.map(c => 
            c.id === editingClass.id 
            ? { ...c, name: classForm.name, grade: classForm.grade, teacher: classForm.teacher }
            : c
        );
        onUpdate({ ...data, classes: updatedClasses });
    } else {
        // Add
        const newClass: Class = {
            id: crypto.randomUUID(),
            name: classForm.name,
            grade: classForm.grade,
            teacher: classForm.teacher,
            studentCount: 0
        };
        onUpdate({ ...data, classes: [...data.classes, newClass] });
    }
    setShowClassModal(false);
  };

  const handleDeleteClass = (classId: string) => {
    if (confirm('Bạn có chắc muốn xóa lớp này và toàn bộ học sinh? Dữ liệu không thể khôi phục.')) {
      const updatedClasses = data.classes.filter(c => c.id !== classId);
      const updatedStudents = data.students.filter(s => s.classId !== classId);
      const updatedRecords = data.records.filter(r => r.classId !== classId);
      
      onUpdate({
        ...data,
        classes: updatedClasses,
        students: updatedStudents,
        records: updatedRecords
      });
    }
  };

  // --- Student Operations ---

  const getStudentsForClass = (classId: string) => {
    return data.students.filter(s => s.classId === classId);
  };

  const openAddStudentModal = (classId: string) => {
    setEditingStudent(null);
    setStudentForm({ name: '', dateOfBirth: '', classId: classId });
    setShowStudentModal(true);
  };

  const openEditStudentModal = (student: Student) => {
    setEditingStudent(student);
    setStudentForm({ name: student.name, dateOfBirth: student.dateOfBirth || '', classId: student.classId });
    setShowStudentModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
        // Edit
        const updatedStudents = data.students.map(s => 
            s.id === editingStudent.id
            ? { ...s, name: studentForm.name, dateOfBirth: studentForm.dateOfBirth }
            : s
        );
        onUpdate({ ...data, students: updatedStudents });
    } else {
        // Add
        const newStudent: Student = {
            id: crypto.randomUUID(),
            name: studentForm.name,
            classId: studentForm.classId,
            dateOfBirth: studentForm.dateOfBirth
        };
        // Increment count
        const updatedClasses = data.classes.map(c => 
            c.id === studentForm.classId ? { ...c, studentCount: c.studentCount + 1 } : c
        );
        onUpdate({ ...data, students: [...data.students, newStudent], classes: updatedClasses });
    }
    setShowStudentModal(false);
  };

  const handleDeleteStudent = (studentId: string, classId: string) => {
      if(confirm("Xóa học sinh này?")) {
        const updatedStudents = data.students.filter(s => s.id !== studentId);
        const updatedRecords = data.records.filter(r => r.studentId !== studentId);
        
        // Decrement count
        const updatedClasses = data.classes.map(c => 
            c.id === classId ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c
        );

        onUpdate({
            ...data,
            students: updatedStudents,
            records: updatedRecords,
            classes: updatedClasses
        });
      }
  };

  // --- Import ---

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const dataBuffer = evt.target?.result;
        const workbook = XLSX.read(dataBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          alert('File không có dữ liệu!');
          return;
        }

        const existingClasses = [...data.classes];
        const existingStudents = [...data.students];
        
        const findClass = (name: string) => existingClasses.find(c => c.name.toLowerCase() === name.toLowerCase());

        let addedStudentsCount = 0;
        let newClassesCount = 0;

        jsonData.forEach((row: any) => {
          const name = row['HỌ VÀ TÊN'] || row['Họ và tên'] || row['Ho va ten'] || row['HO VA TEN'] || row['Name'];
          const className = row['LỚP'] || row['Lớp'] || row['Lop'] || row['Class'];
          const dob = row['NGÀY SINH'] || row['Ngày sinh'] || row['Ngay sinh'] || row['Date of Birth'] || row['Dob'];

          if (name && className) {
            const cleanClassName = String(className).trim();
            const cleanName = String(name).trim();
            
            let cls = findClass(cleanClassName);

            if (!cls) {
              const gradeMatch = cleanClassName.match(/\d+/);
              const grade = gradeMatch ? parseInt(gradeMatch[0]) : 0;
              
              cls = {
                id: crypto.randomUUID(),
                name: cleanClassName,
                grade: grade,
                teacher: 'Chưa cập nhật',
                studentCount: 0
              };
              existingClasses.push(cls);
              newClassesCount++;
            }

            const isDuplicate = existingStudents.some(s => 
                s.classId === cls!.id && 
                s.name.toLowerCase() === cleanName.toLowerCase()
            );
            
            if (!isDuplicate) {
                const newStudent: Student = {
                  id: crypto.randomUUID(),
                  name: cleanName,
                  classId: cls.id,
                  dateOfBirth: dob ? String(dob) : undefined
                };
                existingStudents.push(newStudent);
                addedStudentsCount++;
            }
          }
        });

        const updatedClasses = existingClasses.map(c => ({
          ...c,
          studentCount: existingStudents.filter(s => s.classId === c.id).length
        }));

        onUpdate({
          ...data,
          classes: updatedClasses,
          students: existingStudents
        });

        alert(`Nhập thành công!\n- Đã thêm ${addedStudentsCount} học sinh.\n- Đã tạo mới ${newClassesCount} lớp.`);

      } catch (error) {
        console.error("Excel import error:", error);
        alert("Lỗi khi đọc file Excel. Vui lòng đảm bảo file có các cột: HỌ VÀ TÊN, LỚP, NGÀY SINH.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; 
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Danh sách lớp học</h2>
        <div className="flex items-center gap-3">
             
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportExcel} 
                accept=".xlsx, .xls" 
                className="hidden" 
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="h-11 px-5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
                <UploadCloud size={20} /> Import Excel
            </button>
            <button 
                onClick={openAddClassModal}
                className="h-11 px-6 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2">
                <Plus size={20} /> Thêm Lớp
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên lớp hoặc giáo viên..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
             <select
                className="appearance-none pl-4 pr-10 py-2 bg-slate-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer text-slate-700"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
                <option value="all">Tất cả khối</option>
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
            </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Class List Table Style */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                     <tr>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lớp</th>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Khối</th>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">GVCN</th>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Sĩ số</th>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                     </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredClasses.map((cls) => (
                        <React.Fragment key={cls.id}>
                            <tr 
                                onClick={() => toggleExpand(cls.id)}
                                className={`cursor-pointer transition-colors group ${expandedClassId === cls.id ? 'bg-primary-light' : 'hover:bg-primary-light/50'}`}
                            >
                                <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                         <div className={`size-8 rounded-lg flex items-center justify-center font-bold text-xs ${expandedClassId === cls.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                                             {cls.name.substring(0, 3)}
                                         </div>
                                         <span className="text-sm font-bold text-slate-900">{cls.name}</span>
                                     </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">Khối {cls.grade}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{cls.teacher}</td>
                                <td className="px-6 py-4 text-center">
                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                         {cls.studentCount}
                                     </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                     <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={(e) => openEditClassModal(cls, e)}
                                            className="p-2 text-slate-400 hover:bg-white hover:text-primary rounded-lg transition-colors shadow-sm border border-transparent hover:border-slate-200">
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.id); }}
                                            className="p-2 text-slate-400 hover:bg-white hover:text-rose-500 rounded-lg transition-colors shadow-sm border border-transparent hover:border-slate-200">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className={`transition-transform duration-200 ${expandedClassId === cls.id ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={20} className="text-slate-400" />
                                        </div>
                                     </div>
                                </td>
                            </tr>
                            
                            {/* Expanded Area */}
                            {expandedClassId === cls.id && (
                                <tr>
                                    <td colSpan={5} className="p-0 border-b border-slate-100">
                                        <div className="bg-slate-50/50 p-6 shadow-inner">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                    <Users size={18} className="text-primary" /> 
                                                    Danh sách học sinh lớp {cls.name}
                                                </h4>
                                                <button 
                                                    onClick={() => openAddStudentModal(cls.id)}
                                                    className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-primary hover:text-primary transition-all flex items-center font-bold shadow-sm">
                                                    <UserPlus size={14} className="mr-1.5"/> Thêm học sinh
                                                </button>
                                            </div>
                                            
                                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                                <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                                    <tr>
                                                    <th className="px-4 py-3 border-b border-slate-100 w-16 text-center">STT</th>
                                                    <th className="px-4 py-3 border-b border-slate-100">Họ và tên</th>
                                                    <th className="px-4 py-3 border-b border-slate-100">Ngày sinh</th>
                                                    <th className="px-4 py-3 border-b border-slate-100 text-right">Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getStudentsForClass(cls.id).map((student, idx) => (
                                                    <tr key={student.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                                        <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                                                        <td className="px-4 py-3 text-slate-900 font-medium">{student.name}</td>
                                                        <td className="px-4 py-3 text-slate-500">{student.dateOfBirth || '-'}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button onClick={() => openEditStudentModal(student)} className="text-slate-400 hover:text-primary mr-3"><Edit size={14} /></button>
                                                            <button onClick={() => handleDeleteStudent(student.id, cls.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                                                        </td>
                                                    </tr>
                                                    ))}
                                                    {getStudentsForClass(cls.id).length === 0 && (
                                                        <tr>
                                                            <td colSpan={4} className="px-4 py-8 text-center text-slate-500 bg-slate-50/50 border-dashed">
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <FileSpreadsheet className="text-slate-300" size={32} />
                                                                    <p>Chưa có học sinh nào.</p>
                                                                    <span className="text-xs text-slate-400">Nhập từ Excel hoặc thêm thủ công.</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                     {filteredClasses.length === 0 && (
                        <tr>
                             <td colSpan={5} className="py-12 text-center text-slate-500">
                                Không tìm thấy lớp học nào.
                            </td>
                        </tr>
                    )}
                </tbody>
             </table>
        </div>
      </div>

      {/* --- Class Modal --- */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">
                        {editingClass ? 'Cập nhật lớp học' : 'Thêm lớp học mới'}
                    </h3>
                    <button onClick={() => setShowClassModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSaveClass} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên lớp <span className="text-rose-500">*</span></label>
                        <input 
                            type="text" 
                            required
                            placeholder="Ví dụ: 10A1"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                            value={classForm.name}
                            onChange={(e) => setClassForm({...classForm, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Khối <span className="text-rose-500">*</span></label>
                        <select 
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                            value={classForm.grade}
                            onChange={(e) => setClassForm({...classForm, grade: Number(e.target.value)})}
                        >
                            <option value={6}>Khối 6</option>
                            <option value={7}>Khối 7</option>
                            <option value={8}>Khối 8</option>
                            <option value={9}>Khối 9</option>
                            <option value={10}>Khối 10</option>
                            <option value={11}>Khối 11</option>
                            <option value={12}>Khối 12</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Giáo viên chủ nhiệm</label>
                        <input 
                            type="text" 
                            placeholder="Nhập tên GVCN"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                            value={classForm.teacher}
                            onChange={(e) => setClassForm({...classForm, teacher: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={() => setShowClassModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Hủy</button>
                        <button type="submit" className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 flex items-center transition-all">
                            <Save size={18} className="mr-2" /> Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- Student Modal --- */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">
                        {editingStudent ? 'Sửa thông tin học sinh' : 'Thêm học sinh mới'}
                    </h3>
                    <button onClick={() => setShowStudentModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSaveStudent} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và tên <span className="text-rose-500">*</span></label>
                        <input 
                            type="text" 
                            required
                            placeholder="Nhập họ tên học sinh"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                            value={studentForm.name}
                            onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày sinh</label>
                        <input 
                            type="text" 
                            placeholder="DD/MM/YYYY"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                            value={studentForm.dateOfBirth}
                            onChange={(e) => setStudentForm({...studentForm, dateOfBirth: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={() => setShowStudentModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Hủy</button>
                        <button type="submit" className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 flex items-center transition-all">
                            <Save size={18} className="mr-2" /> Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default ClassManager;