
import React, { useState } from 'react';
import { UserRole, User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onCancel: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Demo Credentials Logic
    if (email === 'vijay' && password === '1234') {
      onLogin({ 
        name: 'Vijay (Admin)', 
        email: 'vijay@vistaraku-demo.com',
        role: 'admin' 
      });
      return;
    }

    // Default Customer Login for anything else
    if (email && password) {
       onLogin({ 
        name: email.split('@')[0], 
        email: email,
        role: 'customer' 
      });
    } else {
      setError('Please enter both username and password.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-slide-up border border-[#5D7C52]/20">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-bold serif text-[#4A3728]">The Portal</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#A4C639] mt-2">
                LeafyLife Heritage Access
              </p>
            </div>
            <button onClick={onCancel} className="text-gray-400 hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-8 p-5 bg-[#FAF9F6] rounded-2xl border border-[#5D7C52]/10">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5D7C52] mb-1">Demo Credentials:</p>
            <p className="text-sm font-bold text-[#4A3728]">User: <span className="text-[#A4C639]">vijay</span></p>
            <p className="text-sm font-bold text-[#4A3728]">Pass: <span className="text-[#A4C639]">1234</span></p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/60 mb-2 ml-2">Username / Email</label>
              <input 
                required 
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-5 bg-[#FAF9F6] border-2 border-transparent focus:border-[#A4C639] rounded-2xl outline-none transition-all font-bold text-[#4A3728]" 
                placeholder="Enter username..." 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#5D7C52]/60 mb-2 ml-2">Secret Key</label>
              <input 
                required 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-5 bg-[#FAF9F6] border-2 border-transparent focus:border-[#A4C639] rounded-2xl outline-none transition-all font-bold text-[#4A3728]" 
                placeholder="••••" 
              />
            </div>

            <button type="submit" className="w-full btn-leaf py-6 rounded-2xl font-black uppercase tracking-[0.3em] mt-4 shadow-xl">
              Enter the Forest
            </button>
          </form>

          <p className="mt-10 text-center text-[10px] font-medium text-[#5D7C52]/40 uppercase tracking-widest">
            By entering, you agree to our <br /> Sustainable Privacy Pact
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
