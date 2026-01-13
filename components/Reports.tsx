import React, { useMemo, useState } from 'react';
import { AppData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileDown, Printer, Calendar, Filter, X } from 'lucide-react';

interface ReportsProps {
    data: AppData;
}

type TimeFilter = 'week' | 'month' | 'semester' | 'custom';

const Reports: React.FC<ReportsProps> = ({ data }) => {
    const [selectedClassId, setSelectedClassId] = useState<string>(data.classes[0]?.id || '');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
    const [customDateRange, setCustomDateRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [showCustomModal, setShowCustomModal] = useState(false);

    // Get date range based on filter
    const getDateRange = () => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        switch (timeFilter) {
            case 'week': {
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                return { start: weekAgo.toISOString().split('T')[0], end: today };
            }
            case 'month': {
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                return { start: monthAgo.toISOString().split('T')[0], end: today };
            }
            case 'semester': {
                // Học kỳ I: tháng 9 -> tháng 1, Học kỳ II: tháng 2 -> tháng 5
                const currentMonth = new Date().getMonth();
                if (currentMonth >= 8 || currentMonth === 0) {
                    // Học kỳ I
                    const year = currentMonth >= 8 ? new Date().getFullYear() : new Date().getFullYear() - 1;
                    return { start: `${year}-09-01`, end: today };
                } else {
                    // Học kỳ II
                    const year = new Date().getFullYear();
                    return { start: `${year}-02-01`, end: today };
                }
            }
            case 'custom':
                return customDateRange;
            default:
                return { start: today, end: today };
        }
    };

    const dateRange = getDateRange();

    const classData = useMemo(() => {
        if (!selectedClassId) return null;
        const cls = data.classes.find(c => c.id === selectedClassId);
        const students = data.students.filter(s => s.classId === selectedClassId);

        // Filter records by date range
        const allRecords = data.records.filter(r => r.classId === selectedClassId);
        const records = allRecords.filter(r => r.date >= dateRange.start && r.date <= dateRange.end);

        // Calculate current score for all students
        const studentScores = students.map(s => {
            const sRecords = records.filter(r => r.studentId === s.id);
            const score = 100 + sRecords.reduce((sum, r) => sum + r.points, 0); // Base 100
            const violations = sRecords.filter(r => r.type === 'violation').length;
            const rewards = sRecords.filter(r => r.type === 'reward').length;
            return { ...s, score, violations, rewards };
        });

        const totalViolations = records.filter(r => r.type === 'violation').length;
        const totalRewards = records.filter(r => r.type === 'reward').length;
        const avgScore = studentScores.reduce((sum, s) => sum + s.score, 0) / (students.length || 1);

        // Chart Data (Group by Date)
        const groupedByDate: Record<string, { date: string, score: number }> = {};
        const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let runningScore = 100 * students.length; // Class Total Base

        sortedRecords.forEach(r => {
            runningScore += r.points;
            groupedByDate[r.date] = { date: r.date.split('-').reverse().join('/'), score: runningScore / (students.length || 1) };
        });

        const chartData = Object.values(groupedByDate);

        return {
            cls,
            studentScores: studentScores.sort((a, b) => b.score - a.score),
            totalViolations,
            totalRewards,
            avgScore,
            chartData
        };

    }, [data, selectedClassId, dateRange.start, dateRange.end]);

    const handleTimeFilter = (filter: TimeFilter) => {
        if (filter === 'custom') {
            setShowCustomModal(true);
        } else {
            setTimeFilter(filter);
        }
    };

    const handleApplyCustomDate = () => {
        setTimeFilter('custom');
        setShowCustomModal(false);
    };

    const formatDateDisplay = (dateStr: string) => {
        return dateStr.split('-').reverse().join('/');
    };

    if (!classData || !classData.cls) return <div className="text-center p-10 text-slate-500">Không có dữ liệu lớp học.</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap justify-between items-end gap-3">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Thống kê & Báo cáo</h1>
                    <p className="text-slate-500 text-sm">Quản lý hiệu quả thi đua và rèn luyện học sinh.</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded-xl h-11 px-6 bg-white border border-slate-200 font-bold text-sm text-slate-700 shadow-sm hover:border-primary hover:text-primary transition-all">
                        <Printer size={18} /> In báo cáo
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-xl h-11 px-6 bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                        <FileDown size={18} /> Xuất File Excel
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleTimeFilter('week')}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${timeFilter === 'week'
                            ? 'bg-primary text-white border border-primary shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100'
                            }`}
                    >Tuần này</button>
                    <button
                        onClick={() => handleTimeFilter('month')}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${timeFilter === 'month'
                            ? 'bg-primary text-white border border-primary shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100'
                            }`}
                    >Tháng này</button>
                    <button
                        onClick={() => handleTimeFilter('semester')}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${timeFilter === 'semester'
                            ? 'bg-primary text-white border border-primary shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100'
                            }`}
                    >Học kỳ</button>
                    <button
                        onClick={() => handleTimeFilter('custom')}
                        className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors ${timeFilter === 'custom'
                            ? 'bg-primary text-white border border-primary shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        <Calendar size={16} /> Tùy chỉnh
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400">
                        {formatDateDisplay(dateRange.start)} - {formatDateDisplay(dateRange.end)}
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600">Chọn lớp:</span>
                        <div className="relative">
                            <select
                                className="appearance-none pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer min-w-[180px]"
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                            >
                                {data.classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Date Modal */}
            {showCustomModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="p-5 bg-primary text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Calendar size={20} /> Chọn khoảng thời gian
                            </h3>
                            <button onClick={() => setShowCustomModal(false)} className="hover:opacity-75">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-600">Từ ngày:</label>
                                <div className="relative">
                                    <div className="px-4 py-3 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-primary/50 flex items-center justify-between">
                                        <span className="text-slate-700 font-medium">{formatDateDisplay(customDateRange.start)}</span>
                                        <input
                                            type="date"
                                            value={customDateRange.start}
                                            onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <Calendar size={18} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-600">Đến ngày:</label>
                                <div className="relative">
                                    <div className="px-4 py-3 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-primary/50 flex items-center justify-between">
                                        <span className="text-slate-700 font-medium">{formatDateDisplay(customDateRange.end)}</span>
                                        <input
                                            type="date"
                                            value={customDateRange.end}
                                            onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <Calendar size={18} className="text-slate-400" />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleApplyCustomDate}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                            >
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start z-10">
                        <p className="text-slate-500 text-sm font-medium">Điểm TB Lớp</p>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <span className="font-bold text-xs">AVG</span>
                        </div>
                    </div>
                    <p className="text-slate-900 text-3xl font-black z-10">{classData.avgScore.toFixed(2)}</p>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/3 translate-x-1/4">
                        <div className="size-32 bg-indigo-600 rounded-full"></div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start z-10">
                        <p className="text-slate-500 text-sm font-medium">Tổng Vi Phạm</p>
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                            <span className="font-bold text-xs">Warning</span>
                        </div>
                    </div>
                    <p className="text-rose-600 text-3xl font-black z-10">{classData.totalViolations}</p>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/3 translate-x-1/4">
                        <div className="size-32 bg-rose-600 rounded-full"></div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start z-10">
                        <p className="text-slate-500 text-sm font-medium">Tổng Khen Thưởng</p>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <span className="font-bold text-xs">Good</span>
                        </div>
                    </div>
                    <p className="text-emerald-600 text-3xl font-black z-10">{classData.totalRewards}</p>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/3 translate-x-1/4">
                        <div className="size-32 bg-emerald-600 rounded-full"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student Table */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900">Chi tiết xếp hạng học sinh</h3>
                    </div>
                    <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hạng</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Học sinh</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Lỗi</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Thưởng</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Tổng điểm</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {classData.studentScores.map((s, idx) => (
                                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-primary">#{idx + 1}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">{s.name}</td>
                                        <td className="px-6 py-4 text-center text-rose-500 font-medium">{s.violations > 0 ? s.violations : '-'}</td>
                                        <td className="px-6 py-4 text-center text-emerald-500 font-medium">{s.rewards > 0 ? s.rewards : '-'}</td>
                                        <td className={`px-6 py-4 text-right font-black ${s.score >= 100 ? 'text-emerald-600' : s.score < 90 ? 'text-rose-600' : 'text-slate-900'}`}>
                                            {s.score}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Chart Side */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-6">Xu hướng điểm TB</h3>
                        <div className="h-64">
                            {classData.chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={classData.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                        <YAxis domain={['auto', 'auto']} width={30} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="score" stroke="#0D9488" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu biến động</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary to-primary-dark p-6 rounded-xl shadow-lg text-white">
                        <h3 className="font-bold text-lg mb-2">Nhận xét GVCN</h3>
                        <p className="text-sm opacity-90 leading-relaxed">
                            {classData.avgScore >= 100
                                ? "Lớp đang duy trì nề nếp rất tốt. Cần tiếp tục phát huy tinh thần thi đua và giữ vững phong độ trong các tuần tiếp theo."
                                : "Lớp cần chấn chỉnh nề nếp ngay lập tức. Các lỗi vi phạm về giờ giấc và đồng phục đang có xu hướng tăng cao."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
