import React, { useEffect, useState } from 'react';
import supabase from '../utils/supabaseClient';

export default function ChatList({ userId, isClient, onSelect }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    (async () => {
      let q = supabase.from('projects').select('id, description');
      if (isClient) q = q.eq('client_id', userId);
      else         q = q.eq('freelancer_id', userId);

      const { data, error } = await q;
      if (error) console.error('Error loading projects for chat:', error);
      else setProjects(data);
    })();
  }, [userId, isClient]);

  return (
    <ul className="space-y-2">
      {projects.map((p) => {
        let title = p.id;
        try {
          const desc = JSON.parse(p.description);
          title = desc.title || title;
        } catch {}
        return (
          <li key={p.id}>
            <button
              type="button"
              className="w-full text-left px-3 py-2 rounded hover:bg-[#222]"
              onClick={() => onSelect(p.id)}
            >
              {title}
            </button>
          </li>
        );
      })}
      {projects.length === 0 && <li className="text-gray-500">No chats yet</li>}
    </ul>
  );
}