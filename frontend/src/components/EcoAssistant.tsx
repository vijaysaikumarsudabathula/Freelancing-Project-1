
import React, { useState, useRef, useEffect } from 'react';
import { getEcoAdvice } from '../services/geminiService';

interface EcoAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const EcoAssistant: React.FC<EcoAssistantProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    {role: 'ai', text: 'Hi! I am your LeafyLife Eco-Assistant. How can I help you live more sustainably today?'}
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "How to compost areca plates?",
    "Why choose leaf tableware?",
    "Are these plates microwave safe?",
    "Sustainability tips for events"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const userMsg = textToSend || input;
    if (!userMsg.trim()) return;
    
    setInput('');
    setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setLoading(true);
    
    const response = await getEcoAdvice(userMsg);
    setMessages(prev => [...prev, {role: 'ai', text: response || 'I missed that, eco-friend!'}]);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl flex flex-col h-[650px] overflow-hidden border border-gray-100 animate-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-[#2D5A27] p-6 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M17,8C8,10 5,16 5,16C5,16 7,20 15,20C23,20 25,14 25,14C25,14 24,8 17,8Z"/></svg>
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold serif flex items-center gap-2">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              Eco-AI Consultant
            </h3>
            <p className="text-xs text-white/80 font-medium">Powered by Gemini AI Intelligence</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${
                m.role === 'user' 
                  ? 'bg-[#2D5A27] text-white rounded-tr-none shadow-md' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#2D5A27] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#2D5A27] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#2D5A27] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input & Suggestions */}
        <div className="p-4 bg-white border-t">
          {messages.length === 1 && !loading && (
            <div className="mb-4 flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(q)}
                  className="text-xs font-medium text-[#2D5A27] bg-[#E8F3E6] px-3 py-1.5 rounded-full hover:bg-[#2D5A27] hover:text-white transition-all border border-transparent hover:border-[#2D5A27]"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything eco..."
              className="flex-1 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2D5A27] outline-none transition-all text-sm"
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-[#2D5A27] text-white p-4 rounded-2xl hover:bg-[#1a3817] transition-all disabled:opacity-30 disabled:grayscale transform active:scale-95 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoAssistant;
