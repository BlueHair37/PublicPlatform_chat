import React from 'react';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages, isTyping }) => {
    const bottomRef = React.useRef(null);

    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    return (
        <main className="flex-1 overflow-y-auto p-4 space-y-6 bg-busan-light/30 dark:bg-slate-900">
            {messages.map((msg, index) => (
                <MessageBubble
                    key={index}
                    {...msg}
                    isFirstInGroup={true}
                />
            ))}
            {isTyping && (
                <MessageBubble
                    sender="bot"
                    text="<span class='animate-pulse'>AI가 답변을 준비중입니다...</span>"
                    isFirstInGroup={true}
                />
            )}
            <div ref={bottomRef} />
        </main>
    );
};

export default MessageList;
