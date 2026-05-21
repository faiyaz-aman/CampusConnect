import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const QUICK_SUGGESTIONS = [
  'Show me upcoming tech events 💻',
  'What is happening this weekend? 📅',
  'Suggest active sports matches 🏆',
  'Any music jam sessions? 🎵'
];

export default function ChatDrawer() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'model',
      text: "👋 Hi there! I'm Campus Connect AI. I'm strictly grounded in our live campus events database. Ask me about what is happening on campus, who is organizing, locations, dates, or matching interests!"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat history
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen, loading]);

  // Only render for logged-in students or all authenticated users
  if (!user) return null;

  const handleSend = async (textToSend) => {
    const query = (textToSend || message).trim();
    if (!query) return;

    // Add user question to state
    const updatedHistory = [...chatHistory, { sender: 'user', text: query }];
    setChatHistory(updatedHistory);
    setMessage('');
    setLoading(true);

    try {
      // Send chat request to backend
      const response = await api.post('/chat', {
        message: query,
        // Map history to match the structure expected by the backend
        history: updatedHistory.map(h => ({
          sender: h.sender,
          text: h.text
        }))
      });

      setChatHistory(prev => [...prev, { sender: 'model', text: response.data.reply }]);
    } catch (err) {
      console.error('Chat AI failure:', err);
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'model',
          text: "⚠️ Oh no! I hit a connection issue contacting the campus server. Please try asking again shortly."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Animated Ask AI Bubble Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-electric via-electric to-hot text-white h-14 px-5 rounded-full flex items-center gap-2.5 shadow-[0_0_25px_rgba(124,92,255,0.4)] hover:shadow-[0_0_35px_rgba(255,61,138,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 group"
      >
        <span className="relative flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent"></span>
        </span>
        <svg className="w-5 h-5 fill-current text-white animate-pulse" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
        </svg>
        <span className="font-display font-bold text-xs tracking-wider uppercase group-hover:tracking-widest transition-all duration-300">
          Ask AI ✦
        </span>
      </button>

      {/* Slide-out Backdrop Blur Layer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Chatbot Side Drawer Drawer Container */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] z-50 bg-bg border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-surface/50 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-accent to-electric flex items-center justify-center font-display font-bold text-bg text-sm">
              AI
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-ink flex items-center gap-1.5">
                Campus AI Helper <span className="text-[10px] bg-accent/20 text-accent font-semibold px-1.5 py-0.2 rounded">FLASH</span>
              </h3>
              <p className="text-[10px] text-muted">Strictly grounded in campus event schedules</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full border border-white/15 hover:border-white/30 text-muted hover:text-ink flex items-center justify-center text-xs transition"
          >
            ✕
          </button>
        </div>

        {/* Chat History Frame */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chatHistory.map((msg, index) => {
            const isModel = msg.sender === 'model';
            return (
              <div
                key={index}
                className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed transition ${
                    isModel
                      ? 'bg-white/5 border border-white/5 text-ink/90 rounded-tl-none font-body whitespace-pre-wrap'
                      : 'bg-gradient-to-br from-electric/90 to-electric text-white rounded-tr-none shadow-md font-body'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* Typing Loading Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Queries Chips Panel */}
        {chatHistory.length < 3 && !loading && (
          <div className="px-5 py-2.5 bg-white/[0.01] border-t border-white/5 space-y-1.5">
            <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Try asking:</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="chip bg-white/5 border border-white/10 hover:border-accent/40 text-[10px] hover:text-accent font-semibold transition text-left cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Input Bar */}
        <div className="p-4 border-t border-white/10 bg-surface/50 backdrop-blur">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              className="input text-xs py-2 flex-1 rounded-xl bg-white/5 border border-white/10 focus:border-accent text-ink placeholder:text-muted"
              placeholder="Ask AI anything about our campus lineup..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="btn-primary py-2 px-4 rounded-xl text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Send ✦
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
