import React, {useEffect, useState, useRef} from 'react';
import supabase from '../utils/supabaseClient';

export default function ChatSection({projectId, currentUserId}) {
  const [messages, setMessages] = useState([]);
  const [newText, setNewText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!projectId) return;

    (async () => {
      const {data, error} = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, text, timestamp')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: true });
      if (error) console.error('Load messages error:', error);
      else setMessages(data);
    })();
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const sendMessage = async () => {
    const text = newText.trim();
    if (!text) return;

    const {error} = await supabase
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
    <section className="chat-section p-4 bg-[#1a1a1a] rounded-lg flex flex-col h-full">
      <div className="messages overflow-y-auto flex-1 mb-4 space-y-2">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex ${
              m.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow ${
                m.sender_id === currentUserId
                  ? 'bg-[#1abc9c] text-black'
                  : 'bg-[#333] text-white'
              }`}
            >
              <p className="text-sm">{m.text}</p>
              <div className="text-right text-xs text-gray-400 mt-1">
                {new Date(m.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex space-x-2">
        <input
          className="flex-1 bg-[#2a2a2a] text-white rounded px-4 py-2 placeholder-gray-400 focus:outline-none"
          placeholder="Type a message…"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          type="button"
          className="px-4 py-2 bg-[#1abc9c] rounded text-black font-semibold hover:bg-[#16a085] transition"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </section>
  );
}