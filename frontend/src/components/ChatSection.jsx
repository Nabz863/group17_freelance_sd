import {useEffect, useState, useRef} from 'react';
import supabase from '../utils/supabaseClient';

export default function ChatSection({projectId, currentUserId, isClient}) {
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
          filter: `project_id=eq.${projectId}`
        },
        ({new: inserted}) => {
          setMessages((msgs) => [...msgs, inserted]);
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

    const {error} = await supabase.from('messages').insert({
      project_id: projectId,
      sender_id: currentUserId,
      text
    });

    if (error) console.error('Send message error:', error);
    else setNewText('');
  };

  return (
    <main className="chat-container">
      <section className="chat-messages">
        {messages.map((m) => {
          const isSender = m.sender_id === currentUserId;
          return (
            <article
              key={m.id}
              className={`chat-message ${isSender ? 'chat-message-out' : 'chat-message-in'}`}
            >
              <header className="chat-sender">
                {isSender ? 'You' : isClient ? 'Freelancer' : 'Client'}
              </header>
              <p className="chat-text">{m.text}</p>
              <footer className="chat-timestamp">
                {new Date(m.timestamp).toLocaleTimeString()}
              </footer>
            </article>
          );
        })}
        <div ref={bottomRef} />
      </section>

      <form
        className="chat-input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          className="chat-input"
          placeholder="Type a message…"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <button type="submit" className="chat-send-btn">Send</button>
      </form>
    </main>
  );
}