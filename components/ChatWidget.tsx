'use client';

import { useState } from 'react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      
      const data = await response.json();
      const aiMessage = { role: 'assistant', content: data.message || 'AI response received' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not get response' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 z-50"
      >
        💬
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50 border border-gray-200">
          <div className="bg-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">🤖 AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                <p>🤖 AI Command Center</p>
                <p className="text-sm mt-2">Try: "Show me my report"</p>
                <p className="text-sm">"Analyze client"</p>
                <p className="text-sm">"Invoice performance"</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">AI is thinking...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your command..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
