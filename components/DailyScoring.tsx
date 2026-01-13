import React, { useState, useEffect } from 'react';
import { AppData, Category, ScoreRecord, Student } from '../types';
import { Calendar, Save, RotateCcw, CheckCircle, XCircle, Search, Plus, FileDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface DailyScoringProps {
  data: AppData;
  onUpdate: (newData: AppData) => void;
}

const DailyScoring: React.FC<DailyScoringProps> = ({ data, onUpdate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClassId, setSelectedClassId] = useState<string>(data.classes[0]?.id || '');
  const [activeModal, setActiveModal] = useState<{ studentId: string; type: 'violation' | 'reward' } | null>(null);
  const [searchStudent, setSearchStudent] = useState('');

  // Initialize temp records from persistent storage when class/date changes
  useEffect(() => {
    // In a real app with backend, we'd fetch here.
  }, [selectedClassId, selectedDate]);

  const currentClass = data.classes.find(c => c.id === selectedClassId);
  const students = data.students.filter(s => s.classId === selectedClassId);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const getStudentRecordsToday = (studentId: string) => {
    return data.records.filter(r => 
      r.studentId === studentId && 
      r.date === selectedDate
    );
  };

  const handleAddRecord = (category: Category) => {
    if (!activeModal) return;
    
    const newRecord: ScoreRecord = {
        id: crypto.randomUUID(),
        studentId: activeModal.studentId,
        classId: selectedClassId,
        date: selectedDate,
        type: category.type,
        category: category.name,
        points: category.points,
        timestamp: Date.now()
    };

    const updatedRecords = [...data.records, newRecord];
    onUpdate({ ...data, records: updatedRecords });
    setActiveModal(null);
  };

  const removeRecord = (recordId: string) => {
      const updatedRecords = data.records.filter(r => r.id !== recordId);
      onUpdate({ ...data, records: updatedRecords });
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Chấm điểm hàng ngày</h1>
             <p className="text-slate-500 text-sm">Quản lý nề nếp và khen thưởng học sinh theo lớp.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
             <div className="relative">
                 <select
                    className="appearance-none w-48 rounded-xl text-slate-900 border-none bg-white h-11 px-4 pr-10 text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                 >
                    {data.classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                 </select>
                 <Filter className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={16} />
             </div>

             <div className="flex items-center bg-white rounded-xl px-2 h-11 shadow-sm border border-transparent">
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div className="relative">
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border-none bg-transparent text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer" 
                    />
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors">
                    <ChevronRight size={20} />
                </button>
             </div>

             <button 
                onClick={() => window.location.reload()}
                className="flex items-center justify-center bg-primary text-white px-5 h-11 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all gap-2"
             >
                <RotateCcw size={18} />
                <span className="hidden sm:inline">Làm mới</span>
             </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[600px]">
         <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 className="font-bold text-lg text-slate-900">Danh sách học sinh <span className="text-sm font-normal text-slate-500 ml-2">({students.length} học sinh)</span></h3>
             <div className="relative">
                <input 
                    type="text" 
                    placeholder="Tìm tên học sinh..." 
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
         </div>

         <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                    <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-4 w-16 text-center">STT</th>
                        <th className="px-6 py-4">Họ và tên</th>
                        <th className="px-6 py-4">Vi phạm</th>
                        <th className="px-6 py-4">Khen thưởng</th>
                        <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student, idx) => {
                         const records = getStudentRecordsToday(student.id);
                         const violations = records.filter(r => r.type === 'violation');
                         const rewards = records.filter(r => r.type === 'reward');

                        return (
                            <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 text-center text-sm font-medium text-slate-400">{idx + 1}</td>
                                <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs group-hover:bg-primary-light group-hover:text-primary transition-colors">
                                            {student.name.charAt(0)}
                                        </div>
                                        <span className="font-semibold text-slate-900">{student.name}</span>
                                    </div>
                                </td>
                                
                                {/* Violations */}
                                <td className="px-6 py-4 align-top">
                                     <div className="flex flex-wrap gap-2">
                                        {violations.map(v => (
                                            <span key={v.id} className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                                {v.category} <span className="ml-1 opacity-75">{v.points}</span>
                                                <button onClick={() => removeRecord(v.id)} className="ml-1.5 hover:text-rose-800"><XCircle size={12} /></button>
                                            </span>
                                        ))}
                                         {violations.length === 0 && <span className="text-slate-300 text-xs italic">Không có</span>}
                                    </div>
                                </td>

                                {/* Rewards */}
                                <td className="px-6 py-4 align-top">
                                    <div className="flex flex-wrap gap-2">
                                        {rewards.map(r => (
                                            <span key={r.id} className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                {r.category} <span className="ml-1 opacity-75">+{r.points}</span>
                                                <button onClick={() => removeRecord(r.id)} className="ml-1.5 hover:text-emerald-800"><XCircle size={12} /></button>
                                            </span>
                                        ))}
                                         {rewards.length === 0 && <span className="text-slate-300 text-xs italic">Không có</span>}
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => setActiveModal({ studentId: student.id, type: 'violation' })}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Thêm vi phạm">
                                            <XCircle size={20} />
                                        </button>
                                        <button 
                                            onClick={() => setActiveModal({ studentId: student.id, type: 'reward' })}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Khen thưởng">
                                            <CheckCircle size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
         </div>
      </div>

      {/* Modal Selection */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform scale-100 border border-slate-100">
            <div className={`p-5 ${activeModal.type === 'violation' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'} flex justify-between items-center border-b border-transparent`}>
              <h3 className="font-bold text-lg flex items-center gap-2">
                 {activeModal.type === 'violation' ? <XCircle size={20}/> : <CheckCircle size={20}/>}
                {activeModal.type === 'violation' ? 'Chọn lỗi vi phạm' : 'Khen thưởng'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="hover:opacity-75 transition-opacity"><XCircle size={24} /></button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-2">
                    {data.categories
                        .filter(c => c.type === activeModal.type)
                        .map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleAddRecord(cat)}
                            className={`p-3 rounded-xl border text-left transition-all flex justify-between items-center group
                                ${activeModal.type === 'violation' 
                                    ? 'border-rose-100 bg-rose-50/30 hover:bg-rose-100 hover:border-rose-200' 
                                    : 'border-emerald-100 bg-emerald-50/30 hover:bg-emerald-100 hover:border-emerald-200'
                                }`}
                        >
                            <span className="font-semibold text-slate-700 text-sm">{cat.name}</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                activeModal.type === 'violation' 
                                ? 'bg-rose-200 text-rose-700' 
                                : 'bg-emerald-200 text-emerald-700'
                            }`}>
                                {cat.points > 0 ? '+' : ''}{cat.points}đ
                            </span>
                        </button>
                    ))}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyScoring;