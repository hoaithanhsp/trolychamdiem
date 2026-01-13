import React, { useState } from 'react';
import { Flag, LogIn, User, Lock, AlertCircle } from 'lucide-react';

interface LoginModalProps {
    onLogin: () => void;
}

const VALID_CREDENTIALS = {
    username: 'Trần Thị Kim Thoa',
    password: '12345'
};

const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate loading
        setTimeout(() => {
            if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
                localStorage.setItem('flagmaster_logged_in', 'true');
                localStorage.setItem('flagmaster_user', username);
                onLogin();
            } else {
                setError('Tên đăng nhập hoặc mật khẩu không đúng!');
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-rose-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-rose-500 p-8 text-center">
                    <div className="bg-white/20 backdrop-blur-sm size-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Flag size={40} className="text-white" fill="currentColor" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">FlagMaster</h1>
                    <p className="text-white/80 text-sm mt-1">Hệ Thống Quản Lý Cờ Đỏ</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Đăng Nhập</h2>
                        <p className="text-slate-500 text-sm mt-1">Vui lòng nhập thông tin đăng nhập</p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">
                                Tên đăng nhập
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Nhập tên đăng nhập..."
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu..."
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-primary to-rose-500 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn size={20} />
                                Đăng Nhập
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        © 2026 FlagMaster - THPT Hoàng Diệu
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
