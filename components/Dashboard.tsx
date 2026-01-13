import React, { useMemo } from 'react';
import { AppData } from '../types';
import { Users, Trophy, AlertTriangle, School, TrendingUp, TrendingDown, Star, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const today = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const todayRecords = data.records.filter(r => r.date === today);
    const violationsToday = todayRecords.filter(r => r.type === 'violation').length;
    const rewardsToday = todayRecords.filter(r => r.type === 'reward').length;

    // Calculate class scores (Start at 100)
    const classScores = data.classes.map(cls => {
      const classRecords = data.records.filter(r => r.classId === cls.id);
      const totalPoints = classRecords.reduce((sum, r) => sum + r.points, 0);
      const score = 100 + totalPoints;
      return { ...cls, score, totalPoints };
    });

    const sortedClasses = [...classScores].sort((a, b) => b.score - a.score);
    const top5 = sortedClasses.slice(0, 5);
    const bottom5 = sortedClasses.slice(-5).reverse();

    return {
      violationsToday,
      rewardsToday,
      top5,
      bottom5,
      totalStudents: data.students.length,
      totalClasses: data.classes.length,
    };
  }, [data, today]);

  const chartData = stats.top5.map(c => ({
    name: c.name,
    score: c.score
  }));

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
           <div className="flex justify-between items-start mb-4">
                <div className="bg-primary-light text-primary p-3 rounded-xl">
                    <School size={24} />
                </div>
                <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Tổng lớp học</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalClasses}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                    <Users size={24} />
                </div>
                 <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">+2.4%</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Tổng học sinh</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalStudents}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-rose-50 text-rose-500 p-3 rounded-xl">
                    <AlertTriangle size={24} />
                </div>
                 <span className="text-rose-500 text-xs font-bold bg-rose-50 px-2 py-1 rounded-full">Today</span>
            </div>
             <p className="text-slate-500 text-sm font-medium">Vi phạm hôm nay</p>
             <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.violationsToday}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-emerald-50 text-emerald-500 p-3 rounded-xl">
                    <Trophy size={24} />
                </div>
                <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">Today</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Khen thưởng hôm nay</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.rewardsToday}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top 5 Chart */}
        <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-lg font-bold text-slate-900 leading-none">Biểu đồ Top 5 Lớp</h4>
                        <p className="text-sm text-slate-500 mt-1">Dẫn đầu về điểm thi đua</p>
                    </div>
                    <div className="p-2 bg-primary-light text-primary rounded-lg">
                        <Activity size={20} />
                    </div>
                </div>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis domain={[0, 'auto']} tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip 
                            cursor={{fill: '#f1f5f9'}} 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                        />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#0D9488" />
                            ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Rankings */}
        <div className="flex flex-col gap-6">
             {/* Top Classes Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                <div className="p-4 border-b border-slate-100 bg-emerald-50/50 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                        <Star size={16} className="fill-emerald-700" /> Top 5 Xuất Sắc
                    </h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                                <th className="px-4 py-3">Lớp</th>
                                <th className="px-4 py-3 text-right">Điểm</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {stats.top5.map((cls) => (
                                <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-700 text-sm">
                                        <div className="flex flex-col">
                                            <span>{cls.name}</span>
                                            <span className="text-[10px] text-slate-400 font-normal">{cls.teacher}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-emerald-600 text-sm">{cls.score.toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

             {/* Bottom Classes Table */}
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                <div className="p-4 border-b border-slate-100 bg-rose-50/50 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                        <TrendingDown size={16} /> Cần Cải Thiện
                    </h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                                <th className="px-4 py-3">Lớp</th>
                                <th className="px-4 py-3 text-right">Điểm</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {stats.bottom5.map((cls) => (
                                <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-700 text-sm">
                                        <div className="flex flex-col">
                                            <span>{cls.name}</span>
                                            <span className="text-[10px] text-slate-400 font-normal">{cls.teacher}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-rose-600 text-sm">{cls.score.toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;