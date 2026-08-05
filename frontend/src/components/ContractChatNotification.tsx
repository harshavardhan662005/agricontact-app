'use client';

import React, { useState } from 'react';

interface Message {
  id: string;
  sender: 'BUYER' | 'FARMER';
  text: string;
  timestamp: string;
}

interface Notification {
  id: string;
  text: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  time: string;
}

export const ContractChatNotification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'NOTIFICATIONS'>('CHAT');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'FARMER',
      text: 'Hello! I can ship the organic tomatoes by tomorrow morning.',
      timestamp: '10:15 AM',
    },
    {
      id: 'm2',
      sender: 'BUYER',
      text: 'Sounds great. Please ensure the crates are proper moisture-sealed.',
      timestamp: '10:18 AM',
    },
  ]);

  const [notifications] = useState<Notification[]>([
    {
      id: 'n1',
      text: 'Contract #contract_99 proposed by Buyer.',
      type: 'INFO',
      time: '10:00 AM',
    },
    {
      id: 'n2',
      text: 'Escrow deposit of ₹17,500 received.',
      type: 'SUCCESS',
      time: '10:10 AM',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: `m_${Date.now()}`,
      sender: 'BUYER',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50">
        <button
          onClick={() => setActiveTab('CHAT')}
          className={`flex-1 py-3 text-sm font-semibold transition ${
            activeTab === 'CHAT'
              ? 'bg-white text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          💬 Contract Discussion
        </button>
        <button
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`flex-1 py-3 text-sm font-semibold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'NOTIFICATIONS'
              ? 'bg-white text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🔔 Notifications
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
            {notifications.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'CHAT' ? (
          <div className="space-y-4">
            <div className="h-48 overflow-y-auto space-y-2 pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'BUYER' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs ${
                      msg.sender === 'BUYER'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {msg.sender} • {msg.timestamp}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-gray-100">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message to the farmer..."
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
              >
                Send
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-2.5 h-60 overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span>{notif.type === 'SUCCESS' ? '✅' : 'ℹ️'}</span>
                  <span className="text-gray-700 font-medium">{notif.text}</span>
                </div>
                <span className="text-[10px] text-gray-400">{notif.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};