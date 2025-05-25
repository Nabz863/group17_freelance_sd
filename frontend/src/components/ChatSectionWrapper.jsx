import {useState, useEffect} from 'react';
import ChatList from './ChatList';
import ChatSection from './ChatSection';

export default function ChatSectionWrapper({user, isClient}) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    if (!selectedProject) setShowList(true);
  }, [selectedProject]);

  if (!user) return null;

  return (
    <section className="w-full h-full flex bg-[#0c0c0c]">
      {showList && (
        <ChatList
          userId={user.sub}
          isClient={isClient}
          onSelect={(projectId, title) => {
            setSelectedProject(projectId);
            setProjectTitle(title || 'Chat');
            setShowList(false);
          }}
        />
      )}

      {selectedProject && (
        <section className="flex-1 flex flex-col h-full">
          <header className="flex items-center justify-between px-4 py-2 border-b border-[#222] bg-[#121212]">
            <button
              className="text-white text-sm hover:text-accent transition ripple"
              onClick={() => setSelectedProject(null)}
            >
              ← Back to Chats
            </button>
            <h2 className="text-white text-sm font-semibold truncate">
              {projectTitle}
            </h2>
          </header>

          <ChatSection
            projectId={selectedProject}
            currentUserId={user.sub}
            isClient={isClient}
          />
        </section>
      )}

      {!selectedProject && !showList && (
        <section className="flex-1 flex items-center justify-center text-gray-500">
          <p>Select a chat to begin messaging.</p>
        </section>
      )}
    </section>
  );
}