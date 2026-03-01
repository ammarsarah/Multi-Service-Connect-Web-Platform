import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import aiService from '../services/aiService';

const SUGGESTED_QUESTIONS = [
  'What services are available in Paris?',
  'How does the booking process work?',
  'How can I become a verified provider?',
  'What payment methods are accepted?',
  'How does the rating system work?',
];

const INITIAL_MESSAGE = {
  id: 1,
  role: 'assistant',
  content: 'Hello! I\'m your Multi-Service Connect AI assistant. I can help you find services, understand how the platform works, or answer any questions you might have. How can I assist you today?',
};

export default function ChatPage() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg = { id: Date.now(), role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { data } = await aiService.sendChatMessage(msg, history);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.message || data.response || 'I\'m here to help! Could you clarify your question?' }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const reset = () => {
    setMessages([INITIAL_MESSAGE]);
    inputRef.current?.focus();
  };

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 128px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 46, height: 46, borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: '0 0 2px' }}>AI Assistant</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
              Online · Ready to help
            </div>
          </div>
        </div>
        <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#64748b', fontWeight: '600', transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <RefreshCw size={14} /> New Chat
        </button>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '10px', alignItems: 'flex-end' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '2px' }}>
                <Bot size={16} color="#fff" />
              </div>
            )}
            <div style={{
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#ffffff',
              color: msg.role === 'user' ? '#ffffff' : '#1e293b',
              fontSize: '14px',
              lineHeight: 1.6,
              boxShadow: msg.role === 'assistant' ? '0 1px 4px rgba(0,0,0,0.06)' : '0 2px 8px rgba(99,102,241,0.3)',
              border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>
                U
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={16} color="#fff" />
            </div>
            <div style={{ padding: '14px 16px', background: '#fff', borderRadius: '18px 18px 18px 4px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {/* Suggested questions (show only at start) */}
        {messages.length === 1 && (
          <div style={{ margin: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginBottom: '10px', fontWeight: '600' }}>
              <Sparkles size={12} /> SUGGESTED QUESTIONS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SUGGESTED_QUESTIONS.map(q => (
                <button key={q} onClick={() => send(q)} style={{ padding: '8px 14px', background: '#f0f0ff', color: '#6366f1', border: '1.5px solid #e0e0ff', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f0f0ff'; e.currentTarget.style.color = '#6366f1'; }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{ paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '8px 8px 8px 16px', transition: 'border-color 0.15s' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = '#6366f1'}
          onBlurCapture={e => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask me anything... (Enter to send, Shift+Enter for newline)"
            rows={1}
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              fontSize: '14px', lineHeight: 1.5, fontFamily: 'Inter, sans-serif',
              color: '#1e293b', background: 'transparent', maxHeight: '120px', overflowY: 'auto',
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
              background: input.trim() && !loading ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#e2e8f0',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: input.trim() && !loading ? '#fff' : '#94a3b8',
              transition: 'all 0.15s',
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
          AI responses are for guidance only. Always verify important information.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
      `}</style>
    </div>
  );
}
