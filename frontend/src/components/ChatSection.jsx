// src/components/ChatSection.jsx

import React, { useEffect, useState, useRef } from 'react';
import supabase from '../utils/supabaseClient';

export default function ChatSection({ projectId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newText, setNewText] = useState('');
  const bottomRef = useRef(null);

  // 1) Load existing messages
  useEffect(() => {
    if (!projectId) return;
    (async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, text, timestamp')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: true });
      if (error) console.error('Load messages error:', error);
      else setMessages(data);
    })();
  }, [projectId]);

  // 2) Subscribe to new messages
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel('public:messages')                                // any unique name
      .on(
        'postgres_changes',                                      // Realtime Postgres changes
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`
        },
        ({ new: inserted }) => {
          setMessages(msgs => [...msgs, inserted]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // 3) Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4) Sending
  const sendMessage = async () => {
    const text = newText.trim();
    if (!text) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        project_id: projectId,
        sender_id: currentUserId,
        receiver_id: null,
        text
      });

    if (error) console.error('Send message error:', error);
    else setNewText('');
  };

  return (
    <section className="chat-section flex flex-col h-full bg-white rounded-lg shadow-lg">
      <header className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600">👤</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Project Chat</h2>
              <p className="text-sm text-gray-600">Active now</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <span className="text-xl">🔍</span>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <span className="text-xl">⋮</span>
            </button>
          </div>
        </div>
      </header>

      <section className="messages flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <article
            key={m.id}
            className={`flex ${
              m.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <section
              className={`max-w-[70%] ${
                m.sender_id === currentUserId
                  ? 'bg-[#128C7E] text-white'
                  : 'bg-gray-100 text-gray-800'
              } rounded-lg p-3 relative`}
            >
              <p className="text-sm text-gray-800">{m.text}</p>
              <span className="text-xs absolute bottom-2 right-2 text-gray-600">
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </section>
          </article>
        ))}
        <span ref={bottomRef} />
      </section>

      <footer className="border-t border-gray-200 p-3">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:text-gray-800">
            <span className="text-xl">📷</span>
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800">
            <span className="text-xl">📝</span>
          </button>
          <input
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#128C7E] focus:border-transparent"
            placeholder="Type a message…"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            type="button"
            className="p-2 text-[#128C7E] hover:bg-[#128C7E] hover:text-white rounded-full transition-colors"
            onClick={sendMessage}
          >
            <span className="text-xl">🚀</span>
          </button>
        </div>
      </footer>
    </section>
  );
}

