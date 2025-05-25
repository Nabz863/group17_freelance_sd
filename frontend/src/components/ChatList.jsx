import {useEffect, useState} from 'react';
import supabase from '../utils/supabaseClient';

export default function ChatList({userId, isClient, onSelect}) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      let q = supabase.from('projects').select('id, description');
      if (isClient) {
        q = q.eq('client_id', userId);
      } else {
        q = q.eq('freelancer_id', userId);
      }

      const { data, error } = await q;
      if (error) {
        console.error('Error loading projects for chat:', error);
      } else {
        setProjects(data);
      }
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