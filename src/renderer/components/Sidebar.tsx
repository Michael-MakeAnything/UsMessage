import { useStore } from '../store';

function Sidebar() {
  const { conversations, selectedConversationId, selectConversation, isSidebarCollapsed } = useStore();

  if (isSidebarCollapsed) {
    return null;
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Messages</h2>
      </div>
      <div className="conversation-list">
        {conversations.length === 0 ? (
          <div className="empty-state">
            <p>No conversations</p>
            <p className="hint">Connect your iPhone to see messages</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`conversation-item ${selectedConversationId === conversation.id ? 'selected' : ''}`}
              onClick={() => selectConversation(conversation.id)}
            >
              <div className="avatar">
                {conversation.avatar ? (
                  <img src={conversation.avatar} alt="" />
                ) : (
                  <span>{conversation.displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="conversation-info">
                <span className="name">{conversation.displayName}</span>
                {conversation.lastMessage && (
                  <span className="preview">{conversation.lastMessage.text}</span>
                )}
              </div>
              {conversation.unreadCount > 0 && (
                <span className="unread-badge">{conversation.unreadCount}</span>
              )}
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
