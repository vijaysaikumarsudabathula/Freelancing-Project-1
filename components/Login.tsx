
import React, { useState } from 'react';
import { User } from '../types';
import Logo from './Logo';
import { findUserByEmail, addUser } from '../services/database';

interface LoginProps {
  onLogin: (user: User) => void;
  onCancel: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const inputEmail = email.trim();
    const inputPass = password;

    if (mode === 'login') {
      if (isAdmin) {
        // Admin credentials (hardcoded check)
        const isLatha = inputEmail.toUpperCase() === 'LATHA@GMAIL.COM' && inputPass === 'deepthi@1234';
        const isVijay = inputEmail.toUpperCase() === 'VIJAY@GMAIL.COM' && inputPass === 'vijay@567';

        if (isLatha || isVijay) {
          onLogin({ 
            id: isLatha ? 'u-admin-1' : 'u-admin-2', 
            name: isLatha ? 'K. Latha' : 'Vijay', 
            email: inputEmail.toLowerCase(), 
            role: 'admin', 
            joinedDate: new Date().toISOString() 
          });
        } else {
          setError('Invalid Admin Credentials.');
        }
      } else {
        // Customer login
        const existingUser = findUserByEmail(inputEmail);
        if (existingUser && existingUser.password === inputPass && existingUser.role === 'customer') {
          onLogin(existingUser);
        } else {
          setError('Invalid email or password. Please try again or create an account.');
        }
      }
    } else {
      // Signup mode
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      
      const existing = findUserByEmail(inputEmail);
      if (existing) {
        setError('An account with this email already exists.');
        return;
      }

      const newUser: User = {
        id: `u-${Date.now()}`,
        name: name || inputEmail.split('@')[0],
        email: inputEmail.toLowerCase(),
        password: inputPass,
        role: 'customer',
        joinedDate: new Date().toISOString()
      };
      
      addUser(newUser);
      onLogin(newUser);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl animate-slide-up border border-[#2D5A27]/10 relative">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#A4C639]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#2D5A27]/10 rounded-full blur-3xl"></div>

        <div className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col items-center text-center mb-8">
             <Logo className="w-16 h-16 mb-4 transform hover:rotate-12 transition-transform duration-500" showText={false} />
             <h2 className="text-3xl font-bold serif text-[#4A3728] mb-1">
               {mode === 'signup' ? 'Create Account' : isAdmin ? 'Admin Portal' : 'Welcome Back'}
             </h2>
             <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#A4C639]">Deepthi Enterprises Secure Access</p>
          </div>

          <div className="flex bg-[#FAF9F6] p-1.5 rounded-2xl mb-8 border border-[#2D5A27]/5">
            <button 
              type="button"
              onClick={() => { setMode('login'); setIsAdmin(false); setError(''); }} 
              className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${mode === 'login' && !isAdmin ? 'bg-white shadow-md text-[#2D5A27]' : 'text-[#2D5A27]/30'}`}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => { setMode('signup'); setIsAdmin(false); setError(''); }} 
              className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white shadow-md text-[#2D5A27]' : 'text-[#2D5A27]/30'}`}
            >
              Sign Up
            </button>
            <button 
              type="button"
              onClick={() => { setMode('login'); setIsAdmin(true); setError(''); }} 
              className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${mode === 'login' && isAdmin ? 'bg-white shadow-md text-[#2D5A27]' : 'text-[#2D5A27]/30'}`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Full Name</label>
                <input 
                  required 
                  type="text"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full p-4 bg-[#FAF9F6] border-2 border-transparent focus:border-[#A4C639] rounded-2xl outline-none font-bold text-sm shadow-sm transition-all" 
                  placeholder="Your Name" 
                />
              </div>
            )}
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Gmail Address</label>
              <input 
                required 
                type="email"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full p-4 bg-[#FAF9F6] border-2 border-transparent focus:border-[#A4C639] rounded-2xl outline-none font-bold text-sm shadow-sm transition-all" 
                placeholder="example@gmail.com" 
              />
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Password</label>
              <input 
                required 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full p-4 bg-[#FAF9F6] border-2 border-transparent focus:border-[#A4C639] rounded-2xl outline-none font-bold text-sm shadow-sm transition-all" 
                placeholder="••••••••" 
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Confirm Password</label>
                <input 
                  required 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  className="w-full p-4 bg-[#FAF9F6] border-2 border-transparent focus:border-[#A4C639] rounded-2xl outline-none font-bold text-sm shadow-sm transition-all" 
                  placeholder="••••••••" 
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-100 animate-shake">
                <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-5 bg-[#2D5A27] text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:shadow-[#2D5A27]/30 transition-all transform active:scale-95 flex items-center justify-center gap-3"
            >
              {mode === 'signup' ? 'Create Account' : 'Secure Login'}
            </button>
          </form>

          <button 
            type="button"
            onClick={onCancel} 
            className="w-full mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-[#2D5A27]/40 hover:text-[#2D5A27] transition-colors"
          >
            ← Back to Store
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
