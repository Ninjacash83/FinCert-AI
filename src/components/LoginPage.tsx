import React, { useState } from 'react';
import { mockUsers } from '../data/mockData';
import { UserProfile } from '../types';
import { ShieldCheck, Award, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onBackToLanding: () => void;
}

export default function LoginPage({ onLoginSuccess, onBackToLanding }: LoginPageProps) {
  const [selectedUser, setSelectedUser] = useState<UserProfile>(mockUsers[0]);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password === 'FINORA26') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(selectedUser);
      }, 800);
    } else {
      setError('Kata sandi salah! Silakan gunakan kata sandi resmi FINORA26.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 animate-fade-in" id="login-container">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Top Branding Panel */}
        <div className="bg-gradient-to-br from-hijau-botol to-dark-green text-white p-8 text-center relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px]" />
          <div className="relative z-10 space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
              <Award className="w-7 h-7 text-emas stroke-[2.5]" />
            </div>
            
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">FinCert <span className="text-emas">AI</span></h2>
              <p className="text-[10px] text-emas uppercase font-bold tracking-wider">by FINORA GROUP</p>
            </div>
            
            <p className="text-xs text-hijau-soft/80 font-medium">
              Portal Keamanan Halaman Admin & Operator
            </p>
          </div>
        </div>

        {/* Login Form Panel */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Form Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Pilih Akun / Peran Masuk
            </label>
            <p className="text-[11px] text-gray-500">
              Silakan pilih salah satu peran di bawah untuk menguji tingkat otorisasi sistem.
            </p>
          </div>

          {/* User Role Quick Select Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {mockUsers.map((user) => {
              const isSelected = selectedUser.id === user.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setSelectedUser(user);
                    setError('');
                  }}
                  className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-hijau-botol bg-hijau-soft/30 ring-2 ring-hijau-botol/10'
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-100 mb-1.5"
                    referrerPolicy="no-referrer"
                  />
                  <span className={`text-[10px] font-black tracking-tight leading-tight ${
                    isSelected ? 'text-hijau-botol' : 'text-slate-700'
                  }`}>
                    {user.role}
                  </span>
                </button>
              );
            })}
          </div>

          {/* User details card preview */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <div className="text-xs">
              <span className="text-gray-400">Pengguna Terpilih: </span>
              <strong className="text-slate-700">{selectedUser.name}</strong>
              <span className="text-[10px] text-gray-400 block">{selectedUser.email}</span>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-600 block">
                Kata Sandi Akses <span className="text-red-500">*</span>
              </label>
            </div>
            
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
                className="w-full text-sm pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-hijau-botol focus:border-hijau-botol font-mono tracking-wider"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-hijau-botol hover:bg-dark-green text-white font-extrabold py-3 px-4 rounded-xl transition duration-150 text-xs uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mengotentikasi...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Masuk ke Halaman Admin
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBackToLanding}
              className="w-full bg-white hover:bg-gray-50 text-gray-500 border border-gray-200 font-bold py-2.5 px-4 rounded-xl transition text-xs text-center cursor-pointer"
            >
              Kembali ke Beranda FinCert AI
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
