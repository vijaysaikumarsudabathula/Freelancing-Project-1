import React, { useState } from 'react';
import { User } from '../types';
import Logo from './Logo';
import { addUser, logLogin, logActivity } from '../services/database';
import * as api from '../services/api';

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const inputEmail = email.trim();
    const inputPass = password;

    try {
      if (mode === 'login') {
        if (isAdmin) {
          // Admin credentials (hardcoded check)
          const isLatha = inputEmail.toUpperCase() === 'LATHA@GMAIL.COM' && inputPass === 'deepthi@1234';
          const isVijay = inputEmail.toUpperCase() === 'VIJAY@GMAIL.COM' && inputPass === 'vijay@123';

          if (isLatha || isVijay) {
            const adminUser = { 
              id: isLatha ? 'u-admin-1' : 'u-admin-2', 
              name: isLatha ? 'K. Latha' : 'Vijay', 
              email: inputEmail.toLowerCase(), 
              role: 'admin' as const, 
              joinedDate: new Date().toISOString() 
            };
            // Log admin login
            try {
              await logLogin(adminUser.id, adminUser.email, 'success', 'Admin login successful');
              await logActivity(adminUser.id, 'LOGIN', `Admin ${adminUser.name} logged in`, { email: adminUser.email });
            } catch (logErr) {
              console.error('Error logging admin login:', logErr);
            }
            onLogin(adminUser);
          } else {
            // Log failed admin login
            try {
              await logLogin(null, inputEmail, 'failed', 'Invalid admin credentials');
            } catch (logErr) {
              console.error('Error logging failed admin login:', logErr);
            }
            setError('Invalid admin email or password. Please check your credentials.');
          }
        } else {
          // Customer login
          try {
            const existingUser = await api.getUserByEmail(inputEmail);
            if (existingUser && existingUser.password === inputPass && existingUser.role === 'customer') {
              // Update last login time
              try {
                await api.updateUser(existingUser.id, { lastLogin: new Date().toISOString() });
              } catch (updateErr) {
                console.error('Error updating last login:', updateErr);
              }
              // Log successful customer login
              try {
                await logLogin(existingUser.id, existingUser.email, 'success', 'Customer login successful');
                await logActivity(existingUser.id, 'LOGIN', `Customer ${existingUser.name} logged in`, { email: existingUser.email });
              } catch (logErr) {
                console.error('Error logging successful login:', logErr);
              }
              onLogin(existingUser);
            } else {
              // Log failed login attempt
              try {
                await logLogin(null, inputEmail, 'failed', 'Invalid credentials');
              } catch (logErr) {
                console.error('Error logging failed login:', logErr);
              }
              setError('Invalid email or password. Please try again.');
            }
          } catch (err) {
            // User not found
            try {
              await logLogin(null, inputEmail, 'failed', 'User not found');
            } catch (logErr) {
              console.error('Error logging user not found:', logErr);
            }
            setError('Invalid email or password. Please try again.');
          }
        }
      } else {
        // Signup mode
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        
        try {
          const existing = await api.getUserByEmail(inputEmail);
          if (existing) {
            setError('An account with this email already exists.');
            setLoading(false);
            return;
          }
        } catch {
          // User doesn't exist, good to proceed
        }

        const newUser = await addUser({
          name: name || inputEmail.split('@')[0],
          email: inputEmail.toLowerCase(),
          password: inputPass,
          role: 'customer',
          joinedDate: new Date().toISOString()
        } as any);
        
        // Log signup activity
        try {
          await logActivity(newUser.id, 'SIGNUP', `New customer account created: ${newUser.name}`, { email: newUser.email, name: newUser.name });
          await logLogin(newUser.id, newUser.email, 'success', 'Account signup successful');
        } catch (logErr) {
          console.error('Error logging signup:', logErr);
        }
        onLogin(newUser);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-md rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl animate-slide-up border border-[#2D5A27]/10 relative max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8 lg:p-12 relative z-10">
          <div className="flex flex-col items-center text-center mb-6 md:mb-8">
             <Logo className="w-12 md:w-16 h-12 md:h-16 mb-3 md:mb-4 transform hover:rotate-12 transition-transform duration-500" showText={false} />
             <h2 className="text-2xl md:text-3xl font-bold serif text-[#4A3728] mb-1">
               {mode === 'signup' ? 'Create Account' : isAdmin ? 'Admin Portal' : 'Welcome Back'}
             </h2>
             <p className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.4em] text-[#A4C639]">Deepthi Enterprises Secure Access</p>
          </div>

          <div className="flex bg-[#FAF9F6] p-1 md:p-1.5 rounded-xl md:rounded-2xl mb-6 md:mb-8 border border-[#2D5A27]/5">
            <button 
              type="button"
              onClick={() => { setMode('login'); setIsAdmin(false); setError(''); }} 
              className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-bold uppercase tracking-widest transition-all ${mode === 'login' && !isAdmin ? 'bg-white shadow-md text-[#2D5A27]' : 'text-[#2D5A27]/30'}`}
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => { setMode('signup'); setIsAdmin(false); setError(''); }} 
              className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-bold uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white shadow-md text-[#2D5A27]' : 'text-[#2D5A27]/30'}`}
            >
              Sign Up
            </button>
            <button 
              type="button"
              onClick={() => { setMode('login'); setIsAdmin(true); setError(''); }} 
              className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-bold uppercase tracking-widest transition-all ${mode === 'login' && isAdmin ? 'bg-white shadow-md text-[#2D5A27]' : 'text-[#2D5A27]/30'}`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {mode === 'signup' && (
              <div>
                <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Full Name</label>
                <input 
                  required 
                  type="text"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full p-3 md:p-4 bg-[#FAF9F6] border-2 border-transparent focus:border-[#A4C639] rounded-lg md:rounded-2xl outline-none font-bold text-sm shadow-sm transition-all" 
                  placeholder="Your Name" 
                />
              </div>
            )}
            <div>
              <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Email</label>
              <input 
                required 
                type="email"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full p-3 md:p-4 bg-[#FAF9F6] border-2 border-transparent focus:border-[#A4C639] rounded-lg md:rounded-2xl outline-none font-bold text-sm shadow-sm transition-all" 
                placeholder="example@gmail.com" 
              />
            </div>
            <div>
              <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Password</label>
              <input 
                required 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full p-3 md:p-4 bg-[#FAF9F6] border-2 border-transparent focus:border-[#A4C639] rounded-lg md:rounded-2xl outline-none font-bold text-sm shadow-sm transition-all" 
                placeholder="••••••••" 
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#2D5A27]/40 mb-2 ml-2">Confirm Password</label>
                <input 
                  required 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  className="w-full p-3 md:p-4 bg-[#FAF9F6] border-2 border-transparent focus:border-[#A4C639] rounded-lg md:rounded-2xl outline-none font-bold text-sm shadow-sm transition-all" 
                  placeholder="••••••••" 
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 rounded-lg md:rounded-xl border border-red-100">
                <p className="text-center text-red-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest break-words">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 md:py-5 bg-[#2D5A27] text-white rounded-lg md:rounded-2xl font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px] shadow-xl hover:shadow-[#2D5A27]/30 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? 'Processing...' : (mode === 'signup' ? 'Create Account' : 'Secure Login')}
            </button>

            {mode === 'signup' && (
              <p className="mt-3 text-[9px] md:text-[11px] text-gray-500 leading-relaxed">📊 All data is saved to the backend SQLite database and persists permanently on the server.</p>
            )}
          </form>

          <button 
            type="button"
            onClick={onCancel} 
            className="w-full mt-4 md:mt-6 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-[#2D5A27]/40 hover:text-[#2D5A27] transition-colors"
          >
            ← Back to Store
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
