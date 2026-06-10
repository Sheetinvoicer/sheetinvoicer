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
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      
      const data = await res.json();
      
      if (res.status === 401) {
        setChat(prev => [...prev, { role: 'ai', content: '⚠️ Please refresh the page and try again.' }]);
      } else if (data.error) {
        setChat(prev => [...prev, { role: 'ai', content: '❌ Error: ' + data.error }]);
      } else {
        setChat(prev => [...prev, { role: 'ai', content: data.message || 'No response' }]);
      }
    } catch (err) {
      setChat(prev => [...prev, { role: 'ai', content: '❌ Connection error. Please try again.' }]);
    }
    
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-purple-600 text-white text-2xl shadow-lg hover:bg-purple-700"
      >
        🤖
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col border">
          <div className="p-3 bg-purple-600 text-white rounded-t-2xl flex justify-between">
            <span>🤖 AI</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {chat.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded-xl ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div>Thinking...</div>}
          </div>
          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 p-2 rounded-lg bg-gray-100"
              placeholder="Show me my report"
            />
            <button onClick={sendMessage} className="px-4 py-2 rounded-lg bg-purple-600 text-white">Send</button>
          </div>
        </div>
      )}
    </>
  );
}
