import React, { useState } from 'react';
import { AppData, Category, RecordType } from '../types';
import { Plus, Pencil, Trash2, Save, X, AlertTriangle, Award } from 'lucide-react';

interface SettingsProps {
  data: AppData;
  onUpdate: (newData: AppData) => void;
}

const Settings: React.FC<SettingsProps> = ({ data, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<RecordType>('violation');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', points: 0 });
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', points: 0 });

  const categories = data.categories.filter(c => c.type === activeTab);

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditForm({ name: category.name, points: Math.abs(category.points) });
    setIsAdding(false);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm.name.trim()) return;
    
    const updatedCategories = data.categories.map(c => 
      c.id === editingId 
        ? { 
            ...c, 
            name: editForm.name.trim(), 
            points: activeTab === 'violation' ? -Math.abs(editForm.points) : Math.abs(editForm.points)
          }
        : c
    );
    
    onUpdate({ ...data, categories: updatedCategories });
    setEditingId(null);
    setEditForm({ name: '', points: 0 });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', points: 0 });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mục này?')) return;
    
    const updatedCategories = data.categories.filter(c => c.id !== id);
    onUpdate({ ...data, categories: updatedCategories });
  };

  const handleAdd = () => {
    if (!newItem.name.trim()) return;
    
    const newCategory: Category = {
      id: `${activeTab === 'violation' ? 'v' : 'r'}-${Date.now()}`,
      name: newItem.name.trim(),
      points: activeTab === 'violation' ? -Math.abs(newItem.points) : Math.abs(newItem.points),
      type: activeTab,
    };
    
    onUpdate({ ...data, categories: [...data.categories, newCategory] });
    setNewItem({ name: '', points: 0 });
    setIsAdding(false);
  };

  const TabButton = ({ type, label, icon: Icon }: { type: RecordType; label: string; icon: any }) => (
    <button
      onClick={() => { setActiveTab(type); setEditingId(null); setIsAdding(false); }}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200
        ${activeTab === type 
          ? type === 'violation' 
            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
            : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-3">
        <TabButton type="violation" label="Vi Phạm" icon={AlertTriangle} />
        <TabButton type="reward" label="Khen Thưởng" icon={Award} />
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
            ${activeTab === 'violation' 
              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
        >
          <Plus size={18} />
          Thêm mục mới
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4">
            Thêm {activeTab === 'violation' ? 'Vi Phạm' : 'Khen Thưởng'} Mới
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Tên mục..."
              value={newItem.name}
              onChange={e => setNewItem({ ...newItem, name: e.target.value })}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Điểm:</span>
              <input
                type="number"
                value={newItem.points}
                onChange={e => setNewItem({ ...newItem, points: parseFloat(e.target.value) || 0 })}
                className="w-24 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
                step="0.5"
                min="0"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Save size={18} /> Lưu
              </button>
              <button
                onClick={() => { setIsAdding(false); setNewItem({ name: '', points: 0 }); }}
                className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-[1fr,auto,auto] gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
          <span>Tên mục</span>
          <span className="text-center w-24">Điểm</span>
          <span className="w-24 text-center">Thao tác</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {categories.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-400">
              Chưa có mục nào. Nhấn "Thêm mục mới" để bắt đầu.
            </div>
          ) : (
            categories.map(category => (
              <div key={category.id} className="grid grid-cols-[1fr,auto,auto] gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                {editingId === category.id ? (
                  <>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      autoFocus
                    />
                    <input
                      type="number"
                      value={editForm.points}
                      onChange={e => setEditForm({ ...editForm, points: parseFloat(e.target.value) || 0 })}
                      className="w-24 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
                      step="0.5"
                      min="0"
                    />
                    <div className="flex gap-1 w-24 justify-center">
                      <button
                        onClick={handleSaveEdit}
                        className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                        title="Lưu"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Hủy"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-slate-800">{category.name}</span>
                    <span className={`w-24 text-center font-bold px-3 py-1 rounded-full text-sm
                      ${category.type === 'violation' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {category.type === 'violation' ? '' : '+'}{category.points}
                    </span>
                    <div className="flex gap-1 w-24 justify-center">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info */}
      <div className={`rounded-xl p-4 text-sm
        ${activeTab === 'violation' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
        <strong>Lưu ý:</strong> {activeTab === 'violation' 
          ? 'Điểm vi phạm sẽ tự động chuyển thành số âm khi lưu.' 
          : 'Điểm khen thưởng sẽ tự động chuyển thành số dương khi lưu.'}
      </div>
    </div>
  );
};

export default Settings;
