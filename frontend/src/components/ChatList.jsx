import {useEffect, useState} from 'react';

export default function ChatList({userId, isClient, onSelect}) {
  const [projects, setProjects] = useState([]);

useEffect(() => {
  if (!userId) return;

  (async () => {
    const res = await fetch('/functions/v1/get-chat-projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, is_client: isClient })
    });

    const data = await res.json();
    if (res.ok) setProjects(data);
    else console.error('Error loading projects:', data.error);
  })();
}, [userId, isClient]);

  return (
    <aside className="w-1/3 max-w-sm h-full overflow-y-auto bg-[#111] border-r border-[#222]">
      <section className="text-white text-lg font-semibold px-4 py-3 border-b border-[#222]">
        Chats
      </section>
      <nav className="flex flex-col">
        {projects.length === 0 && (
          <p className="text-gray-500 px-4 py-4">No chats yet</p>
        )}
        {projects.map(p => {
          let title = p.id;
          try {
            const desc = JSON.parse(p.description);
            title = desc.title || title;
          } catch {}
          return (
            <button
              key={p.id}
              type="button"
              className="text-left px-4 py-3 hover:bg-[#1a1a1a] text-white border-b border-[#222] transition"
              onClick={() => onSelect(p.id)}
            >
              {title}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}