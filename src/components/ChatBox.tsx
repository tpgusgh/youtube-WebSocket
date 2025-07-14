import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import { ChatMessage, User } from '../types';

interface ChatBoxProps {
  messages: ChatMessage[];
  currentUser: User;
  onSendMessage: (message: string) => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  currentUser,
  onSendMessage
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 채팅 헤더 */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <h3 className="text-lg font-semibold text-white">실시간 채팅</h3>
        <p className="text-sm text-gray-400">{messages.length}개의 메시지</p>
      </div>

      {/* 메시지 리스트 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="group">
            <div className={`flex ${message.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.userId === currentUser.id
                  ? 'bg-red-600 text-white'
                  : message.userId === 'system'
                  ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                  : 'bg-gray-700 text-white'
              }`}>
                {message.userId !== currentUser.id && message.userId !== 'system' && (
                  <p className="text-xs text-gray-300 mb-1">{message.userName}</p>
                )}
                <p className="text-sm break-words">{message.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              maxLength={500}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Enter를 눌러 전송 • {newMessage.length}/500
        </p>
      </div>
    </div>
  );
};