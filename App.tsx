import React, { useState, useEffect } from 'react';
import { ViewState, AppData } from './types';
import { getStorageData, saveStorageData, exportData, resetSemester } from './services/storage';
import { LayoutDashboard, Users, ClipboardList, PieChart, Menu, Download, RotateCcw, Flag, Settings as SettingsIcon, X, Calendar } from 'lucide-react';

// Components
import Dashboard from './components/Dashboard';
import ClassManager from './components/ClassManager';
import DailyScoring from './components/DailyScoring';
import Reports from './components/Reports';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [data, setData] = useState<AppData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAcademicYearModal, setShowAcademicYearModal] = useState(false);
  const [academicYear, setAcademicYear] = useState(() => {
    const saved = localStorage.getItem('flagmaster_academic_year');
    return saved ? JSON.parse(saved) : { year: '2025-2026', semester: 'I' };
  });

  // Load data on mount
  useEffect(() => {
    const loadedData = getStorageData();
    setData(loadedData);
  }, []);

  const handleUpdateData = (newData: AppData) => {
    setData(newData);
    saveStorageData(newData);
  };

  const handleExport = () => {
    if (confirm("Tải xuống dữ liệu backup (JSON)?")) {
      exportData();
    }
  };

  const handleReset = () => {
    const confirmation = prompt("Gõ 'RESET' để xác nhận xóa toàn bộ điểm học kỳ này. Danh sách lớp sẽ giữ nguyên.");
    if (confirmation === 'RESET') {
      resetSemester();
      setData(getStorageData());
      alert("Đã reset dữ liệu học kỳ.");
    }
  };

  const handleSaveAcademicYear = () => {
    localStorage.setItem('flagmaster_academic_year', JSON.stringify(academicYear));
    setShowAcademicYearModal(false);
  };

  if (!data) return <div className="min-h-screen flex items-center justify-center text-primary font-bold">Loading FlagMaster...</div>;

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
        ${currentView === view
          ? 'bg-primary text-white shadow-md shadow-primary/20'
          : 'text-slate-600 hover:bg-primary-light hover:text-primary'}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
        <div className="p-6 flex flex-col gap-6 h-full">
          {/* Logo */}
          <div className="flex justify-center">
            <img src="/logo_thoa.jpg" alt="Logo Trần Thị Kim Thoa" className="w-28 h-28 object-contain" />
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-primary size-10 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <Flag size={24} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 text-lg font-bold leading-none">FlagMaster</h1>
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">Hệ Thống Cờ Đỏ</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 flex-1">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="classes" icon={Users} label="Quản Lý Lớp" />
            <NavItem view="scoring" icon={ClipboardList} label="Chấm Cờ Đỏ" />
            <NavItem view="reports" icon={PieChart} label="Báo Cáo" />
            <NavItem view="settings" icon={SettingsIcon} label="Cài Đặt" />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100 space-y-2">
            <button onClick={handleExport} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-primary-light hover:text-primary transition-colors text-sm font-medium">
              <Download size={20} /> Backup Dữ liệu
            </button>
            <button onClick={handleReset} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors text-sm font-medium">
              <RotateCcw size={20} /> Reset Học kỳ
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#f8fafc]">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-800">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-900">
              {currentView === 'dashboard' && 'Tổng Quan'}
              {currentView === 'classes' && 'Quản Lý Lớp Học'}
              {currentView === 'scoring' && 'Chấm Điểm Hàng Ngày'}
              {currentView === 'reports' && 'Báo Cáo & Thống Kê'}
              {currentView === 'settings' && 'Cài Đặt Vi Phạm & Khen Thưởng'}
            </h2>
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <button
              onClick={() => setShowAcademicYearModal(true)}
              className="text-slate-500 text-sm hidden md:flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            >
              <Calendar size={14} />
              Năm học {academicYear.year} • Học kỳ {academicYear.semester}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">Trần Thị Kim Thoa</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-none">THPT Hoàng Diệu</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Số 1 Mạc Đĩnh Chi, Phú Lợi, Cần Thơ</p>
              </div>
              <img
                src="/teacher_avatar.jpg"
                alt="Cô Trần Thị Kim Thoa"
                className="size-11 rounded-full border-2 border-primary/20 object-cover shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* View Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 relative">
          <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
            {currentView === 'dashboard' && <Dashboard data={data} />}
            {currentView === 'classes' && <ClassManager data={data} onUpdate={handleUpdateData} />}
            {currentView === 'scoring' && <DailyScoring data={data} onUpdate={handleUpdateData} />}
            {currentView === 'reports' && <Reports data={data} />}
            {currentView === 'settings' && <Settings data={data} onUpdate={handleUpdateData} />}
          </div>
        </main>
      </div>

      {/* Academic Year Modal */}
      {showAcademicYearModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="p-5 bg-primary text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Calendar size={20} /> Cài đặt năm học
              </h3>
              <button onClick={() => setShowAcademicYearModal(false)} className="hover:opacity-75">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600">Năm học:</label>
                <select
                  value={academicYear.year}
                  onChange={(e) => setAcademicYear(prev => ({ ...prev, year: e.target.value }))}
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="2024-2025">2024-2025</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                  <option value="2027-2028">2027-2028</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600">Học kỳ:</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAcademicYear(prev => ({ ...prev, semester: 'I' }))}
                    className={`flex-1 py-3 rounded-xl font-bold transition-colors ${academicYear.semester === 'I'
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    Học kỳ I
                  </button>
                  <button
                    onClick={() => setAcademicYear(prev => ({ ...prev, semester: 'II' }))}
                    className={`flex-1 py-3 rounded-xl font-bold transition-colors ${academicYear.semester === 'II'
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    Học kỳ II
                  </button>
                </div>
              </div>
              <button
                onClick={handleSaveAcademicYear}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
