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
    const [isLoading, setIsLoading] = useState(false);
    // Generate session ID once per page load to maintain context
    const sessionId = React.useMemo(() => {
        // Simple UUID generation or use crypto.randomUUID if available
        return window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    }, []);

    const handleSendMessage = async (messageData) => {
        // Handle both string (legacy/simple) and object input
        const startMessage = typeof messageData === 'string' ? { type: 'text', content: messageData } : messageData;
        const textContent = startMessage.content;

        if (!textContent && !startMessage.file && !startMessage.lat) return;

        // Construct User Message for UI
        const userMsg = {
            sender: 'user',
            text: textContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: startMessage.type,
            imageFile: startMessage.file, // For local preview
            lat: startMessage.lat,
            lng: startMessage.lng
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        console.log("Sending to backend:", textContent, "Session:", sessionId);

        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: textContent,
                    session_id: sessionId
                    // If we had real image upload, we'd send URL here. 
                    // For location, we might send lat/lng in structured way, but agent parses text fine too.
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
            }

            const data = await response.json();

            // Add bot response
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: data.response,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (error) {
            console.error("Chat API Error:", error);
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    sender: 'bot',
                    text: `<strong>[시스템]</strong> 서버 연결 실패. (${error.message})<br/>(데모 모드) 성공적으로 접수되었습니다.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }, 1000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <Header />
            <MessageList messages={messages} isTyping={isLoading} />
            <InputArea onSendMessage={handleSendMessage} />
        </Layout>
    );
};

export default ChatPage;
