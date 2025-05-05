import React, { useEffect, useState, useRef } from 'react';
import supabase from '../utils/supabaseClient';

export default function ChatSection({ projectId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newText, setNewText] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, text, timestamp')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: true });
      if (error) console.error('Load messages error:', error);
      else setMessages(data);
    })();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const channel = supabase
      .from(`messages:project_id=eq.${projectId}`)
      .on('INSERT', payload => {
        setMessages(msgs => [...msgs, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newText.trim()) return;
    const { error } = await supabase
      .from('messages')
      .insert({
        project_id: projectId,
        sender_id: currentUserId,
        receiver_id: null,
        text: newText,
      });
    if (error) {
      console.error('Send message error:', error);
    } else {
      setNewText('');
    }
  };

  return (
    <section className="chat-section p-4 bg-[#1a1a1a] rounded-lg">
      <div className="messages overflow-y-auto h-64 mb-4">
        {messages.map(m => (
          <div
            key={m.id}
            className={`mb-2 p-2 rounded ${
              m.sender_id === currentUserId
                ? 'bg-[#1abc9c] text-black self-end'
                : 'bg-[#222] text-white'
            }`}
          >
            <p className="text-sm">{m.text}</p>
            <span className="text-xs text-gray-400">
              {new Date(m.timestamp).toLocaleTimeString()}
            </span>
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