'use client';

import { useState } from 'react';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { role: 'ai', content: "🤖 AI Ready! Try: 'Show me my report'" }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;
    
    const userMsg = message;
    setChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setMessage('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      
      const data = await res.json();
      const reply = data.message || data.error || "No response";
      setChat(prev => [...prev, { role: 'ai', content: reply }]);
      
    } catch (err) {
      setChat(prev => [...prev, { role: 'ai', content: 'Error: ' + err.message }]);
    }
    
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-purple-600 text-white text-2xl shadow-lg hover:bg-purple-700 transition-all"
      >
        🤖
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-24 right-6 z-50 w-[450px] h-[550px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">🤖 AI Assistant</h3>
                  <p className="text-xs opacity-90">Ask me about your business</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-lg p-2">✕</button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
              {chat.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap text-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask: Show me my report, Predict cash flow, Send reminders..."
                  className="flex-1 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button 
                  onClick={sendMessage} 
                  disabled={loading}
                  className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-all disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
