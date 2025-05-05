// src/components/ChatSection.jsx

import React, { useEffect, useState, useRef } from 'react';
import supabase from '../utils/supabaseClient';

export default function ChatSection({ projectId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newText, setNewText] = useState('');
  const bottomRef = useRef(null);

  // Helper to load all messages for this project
  const loadMessages = async () => {
    if (!projectId) return;
    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, text, timestamp')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: true });
    if (error) {
      console.error('Load messages error:', error);
    } else {
      console.log('Fetched messages:', data);
      setMessages(data);
    }
  };

  // Initial fetch when project changes
  useEffect(() => {
    loadMessages();
  }, [projectId]);

  // Subscribe to new inserts
  useEffect(() => {
    if (!projectId) return;
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` },
        ({ new: inserted }) => {
          console.log('Realtime insert:', inserted);
          setMessages(msgs => [...msgs, inserted]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // Scroll down on every message update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send and immediately display the new message
  const sendMessage = async () => {
    const text = newText.trim();
    if (!text || !projectId) return;

    const { data: inserted, error } = await supabase
      .from('messages')
      .insert({
        project_id: projectId,
        sender_id: currentUserId,
        receiver_id: null,
        text
      })
      .select('id, sender_id, receiver_id, text, timestamp');

    if (error) {
      console.error('Send message error:', error);
    } else if (inserted && inserted.length) {
      console.log('Inserted message:', inserted[0]);
      setMessages(prev => [...prev, inserted[0]]);
      setNewText('');
    }
  };

  return (
    <section className="chat-section p-4 bg-[#1a1a1a] rounded-lg flex flex-col h-full">
      <div className="messages overflow-y-auto flex-1 mb-4">
        {messages.map(m => (
          <div
            key={m.id}
            className={`mb-2 p-2 rounded flex ${
              m.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`${
                m.sender_id === currentUserId
                  ? 'bg-[#1abc9c] text-black'
                  : 'bg-[#222] text-white'
              } p-2 rounded`}
            >
              <p className="text-sm">{m.text}</p>
              <span className="text-xs text-gray-400">
                {new Date(m.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex space-x-2">
        <input
          className="flex-1 form-input"
          placeholder="Type a message…"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          type="button"
          className="px-4 py-2 bg-[#1abc9c] rounded text-black"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </section>
  );
}
