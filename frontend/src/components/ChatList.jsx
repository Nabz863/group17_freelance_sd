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

      const {data, error} = await q;
      if (error) {
        console.error('Error loading projects for chat:', error);
      } else {
        setProjects(data);
      }
    })();
  }, [userId, isClient]);

  return (
    <ul className="space-y-2 p-4">
      {projects.length === 0 && (
        <li className="text-gray-500">No chats yet</li>
      )}
      {projects.map(p => {
        let title = p.id;
        try {
          const desc = JSON.parse(p.description);
          title = desc.title || title;
        } catch {}
        return (
          <li key={p.id}>
            <button
              type="button"
              className="w-full text-left px-4 py-2 rounded bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white transition"
              onClick={() => onSelect(p.id)}
            >
              {title}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
