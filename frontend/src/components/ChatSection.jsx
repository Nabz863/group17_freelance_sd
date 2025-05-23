import React, {useEffect, useState, useRef} from 'react';
import supabase from '../utils/supabaseClient';

export default function ChatSection({ projectId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newText, setNewText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!projectId) return;

    (async () => {
      const {data, error} = await supabase
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
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`,
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = newText.trim();
    if (!text) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        project_id: projectId,
        sender_id: currentUserId,
        receiver_id: null,
        text,
      });

    if (error) console.error('Send message error:', error);
    else setNewText('');
  };

  return (
    <main className="flex flex-col flex-1 bg-[#1a1a1a] h-full">
      <section className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map(m => {
          const isSender = m.sender_id === currentUserId;
          return (
            <article
              key={m.id}
              className={`max-w-[70%] px-4 py-3 rounded-lg shadow-sm ${
                isSender ? 'bg-[#1abc9c] text-black self-end' : 'bg-[#2a2a2a] text-white self-start'
              }`}
            >
              <header className="text-xs font-bold mb-1">
                {isSender ? 'You' : m.sender_id}
              </header>
              <p className="text-sm">{m.text}</p>
              <footer className="text-right text-xs text-gray-400 mt-1">
                {new Date(m.timestamp).toLocaleTimeString()}
              </footer>
            </article>
          );
        })}
        <div ref={bottomRef} />
      </section>

      <form
        className="flex items-center gap-2 border-t border-[#333] px-4 py-3"
        onSubmit={e => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          className="flex-1 bg-[#2a2a2a] text-white rounded px-4 py-2 placeholder-gray-400 focus:outline-none"
          placeholder="Type a message…"
          value={newText}
          onChange={e => setNewText(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#1abc9c] rounded text-black font-semibold hover:bg-[#16a085] transition"
        >
          Send
        </button>
      </form>
    </main>
  );
}