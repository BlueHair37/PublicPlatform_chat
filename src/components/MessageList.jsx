import React from 'react';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages }) => {
    return (
        <main className="flex-1 overflow-y-auto p-4 space-y-6 bg-busan-light/30 dark:bg-slate-900">
            {messages.map((msg, index) => (
                <MessageBubble
                    key={index}
                    sender={msg.sender}
                    text={msg.text}
                    timestamp={msg.timestamp}
                    isFirstInGroup={true}
                />
            ))}
        </main>
    );
};

export default MessageList;
