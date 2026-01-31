import React, { useState } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import MessageList from '../components/MessageList';
import InputArea from '../components/InputArea';

const ChatPage = () => {
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: '반갑습니다! 부산시민을 위한 AI 민원 상담 서비스입니다. <br/>불편하신 사항이 있다면 언제든 말씀해 주세요.'
        }
    ]);

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        // Add user message to UI immediately
        const newMessages = [...messages, { sender: 'user', text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
        setMessages(newMessages);

        console.log("Sending message to backend:", text);

        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: text }),
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log("Response data:", data);

            // Add bot response
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: data.response
            }]);
        } catch (error) {
            console.error("Chat API Error:", error);
            // Fallback simulation if backend fails
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    sender: 'bot',
                    text: `<strong>[시스템]</strong> 서버 연결 실패. (${error.message})<br/>(데모 모드) 성공적으로 접수되었습니다.`
                }]);
            }, 1000);
        }
    };

    return (
        <Layout>
            <Header />
            <MessageList messages={messages} />
            <InputArea onSendMessage={handleSendMessage} />
        </Layout>
    );
};

export default ChatPage;
