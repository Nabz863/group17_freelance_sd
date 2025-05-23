import {useState} from 'react';
import ChatList from './ChatList';
import ChatSection from './ChatSection';

export default function ChatSectionWrapper({ user, isClient }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showChatList, setShowChatList] = useState(true);

  const handleChatSelect = (projectId) => {
    setSelectedProject(projectId);
    setShowChatList(false);
  };

  const handleBackToList = () => {
    setSelectedProject(null);
    setShowChatList(true);
  };

  if (!user) return null;

  return (
    <div className="w-full h-full flex flex-col bg-[#121212] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[#333] flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {showChatList ? "Messages" : "Chat"}
        </h2>
        {!showChatList ? (
          <button
            className="px-3 py-1 bg-[#333] rounded hover:bg-[#444] text-white"
            onClick={handleBackToList}
          >
            ← Back
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-hidden">
        {showChatList ? (
          <ChatList
            userId={user.sub}
            isClient={isClient}
            onSelect={handleChatSelect}
          />
        ) : (
          <ChatSection
            projectId={selectedProject}
            currentUserId={user.sub}
          />
        )}
      </div>
    </div>
  );
}