import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';

function ChatView() {
  const { selectedConversationId, conversations, messages } = useStore();
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const conversation = conversations.find((c) => c.id === selectedConversationId);
  const conversationMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSend = async () => {
    if (!selectedConversationId || (!inputText.trim() && attachments.length === 0)) return;

    // TODO: Implement actual send via electron API
    const attachmentPaths = attachments.map((f) => URL.createObjectURL(f));
    await window.electronAPI?.sendMessage(selectedConversationId, inputText, attachmentPaths);

    setInputText('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  if (!selectedConversationId) {
    return (
      <main className="chat-view empty">
        <div className="empty-state">
          <h2>UsMessage</h2>
          <p>Select a conversation to start messaging</p>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-view">
      <header className="chat-header">
        <h3>{conversation?.displayName || 'Unknown'}</h3>
        {conversation?.isGroup && (
          <span className="participant-count">{conversation.participants.length} participants</span>
        )}
      </header>

      <div className="messages-container">
        {conversationMessages.map((message) => (
          <div key={message.id} className={`message ${message.isFromMe ? 'sent' : 'received'}`}>
            {!message.isFromMe && conversation?.isGroup && (
              <span className="sender-name">{message.sender}</span>
            )}
            {message.attachments?.map((attachment) => (
              <div key={attachment.id} className="attachment">
                {attachment.type === 'image' && <img src={attachment.url} alt={attachment.filename} />}
                {attachment.type === 'video' && <video src={attachment.url} controls />}
              </div>
            ))}
            {message.text && <p className="message-text">{message.text}</p>}
            <span className="timestamp">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        {attachments.length > 0 && (
          <div className="attachment-preview">
            {attachments.map((file, index) => (
              <div key={index} className="preview-item">
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} alt={file.name} />
                ) : (
                  <span className="file-name">{file.name}</span>
                )}
                <button className="remove-btn" onClick={() => removeAttachment(index)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="input-row">
          <button className="attach-btn" onClick={handleAttachClick} title="Attach file">
            +
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*,video/*"
            style={{ display: 'none' }}
          />
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
          />
          <button className="send-btn" onClick={handleSend} disabled={!inputText.trim() && attachments.length === 0}>
            Send
          </button>
        </div>
      </div>
    </main>
  );
}

export default ChatView;
