import React, { useState } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import MessageList from '../components/MessageList';
import InputArea from '../components/InputArea';

const ChatPage = () => {
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: '반갑습니다! 부산시민을 위한 AI 민원 상담 서비스입니다. <br/>불편하신 사항이 있다면 언제든 말씀해 주세요. (무엇이든 도와드리겠습니다)'
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

        // If image, content might be empty string intially
        const textContent = startMessage.content || (startMessage.type === 'image' ? "사진을 전송했습니다." : "");

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

        // Prepare payload
        let payload = {
            message: textContent,
            session_id: sessionId
        };

        // If Image, convert to Base64
        if (startMessage.file) {
            try {
                const base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(startMessage.file);
                });
                payload.image_data = base64Data;
                payload.message = "이 사진을 분석해서 어떤 민원인지 파악하고 필요한 조치를 알려줘."; // Default prompt for image
            } catch (error) {
                console.error("Image processing error:", error);
            }
        }

        console.log("Sending to backend:", payload.message, "Session:", sessionId);

        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
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
