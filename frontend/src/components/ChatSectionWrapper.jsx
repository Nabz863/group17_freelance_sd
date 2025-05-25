import {useState, useEffect} from 'react';
import ChatList from './ChatList';
import ChatSection from './ChatSection';

export default function ChatSectionWrapper({user, isClient}) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    // Reset to list view when no chat is selected (mobile)
    if (!selectedProject) {
      setShowList(true);
    }
  }, [selectedProject]);

  if (!user) return null;

  return (
    <section className="w-full h-full flex bg-[#0c0c0c]">
      {/* Left Chat List (visible unless collapsed on mobile) */}
      {showList && (
        <ChatList
          userId={user.sub}
          isClient={isClient}
          onSelect={(projectId) => {
            setSelectedProject(projectId);
            setShowList(false);
          }}
        />
      )}

      {/* Right Chat Pane */}
      {selectedProject && (
        <section className="flex-1 flex flex-col h-full">
          {/* Back button for mobile/smaller screens */}
          <header className="flex items-center justify-between px-4 py-2 border-b border-[#222] bg-[#121212]">
            <button
              className="text-white text-sm hover:text-accent transition ripple"
              onClick={() => setSelectedProject(null)}
            >
              ← Back to Chats
            </button>
            <h2 className="text-white text-sm font-semibold truncate">
              Project: {selectedProject}
            </h2>
          </header>

          {/* Actual Chat */}
          <ChatSection
            projectId={selectedProject}
            currentUserId={user.sub}
            isClient={isClient}
          />
        </section>
      )}

      {/* No project selected — show placeholder */}
      {!selectedProject && !showList && (
        <section className="flex-1 flex items-center justify-center text-gray-500">
          <p>Select a chat to begin messaging.</p>
        </section>
      )}
    </section>
  );
}