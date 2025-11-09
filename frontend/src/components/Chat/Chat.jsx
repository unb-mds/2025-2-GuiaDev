import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';
import logo from "../../assets/Logo.svg";
import api from "../../../services/api"



export default function Chat() {
    const [messages, setMessagens] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const [IAThinking, setThinking] = useState(false);
   
    const callTimeoutRef = useRef(null);

    const handleMenssagem = () => {
        if (input.trim() === '' || IAThinking) return;

        const userText = input.trim();

        setThinking(true);
        setInput('');
        setMessagens((prev) => [...prev, { text: userText, sender: 'user' }]);

        if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);

        callTimeoutRef.current = setTimeout(() => {
            chatBotIA(userText);
            callTimeoutRef.current = null;

        }, 200);
    };


   
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages]);

 
    useEffect(() => {
        return () => {
            if (callTimeoutRef.current) {
                clearTimeout(callTimeoutRef.current);
                callTimeoutRef.current = null;
            }

        };
    }, []);

    async function chatBotIA(message) {
        try {

            const res = await api.post('/chat', { message });


            const data = res.data;
            const botText = typeof data === 'string' ? data : (data?.response ?? data?.contents ?? 'Resposta vazia');

            setMessagens((prev) => [...prev, { text: botText, sender: 'bot' }]);
            setThinking(false);


        } catch (err) {
            console.error('Erro ao chamar /chat:', err);
            setMessagens((prev) => [...prev, { text: 'Erro ao obter resposta da IA', sender: 'bot' }]);

            if (callTimeoutRef.current) {
                clearTimeout(callTimeoutRef.current);
                callTimeoutRef.current = null;
            }

            setThinking(false);

        }
    }




    return (
        <div className='chat-box'>
            <div className='chat-messages'>

                <p className='chat-placeholder'>GuiaDev Chat Box</p>
            </div>


            <div className='backgroundMsg'>

                {messages.length === 0 ? (
                    ""
                ) : (
                    messages.map((msg, index) => (

                        <div key={index} className={`chat-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                            <div className='botIcon'>
                                <img src={logo} />
                            </div>

                            <div className='msg'>
                                {msg.text}
                            </div>
                        </div>

                    ))
                )}


                {IAThinking && (
                    <div className="chat-bubble bot typing-indicator">
                        <div className="botIcon"><img src={logo} /></div>
                        <div className="msg">
                            <span className="dot dot-1" />
                            <span className="dot dot-2" />
                            <span className="dot dot-3" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className='chat-input-area'>




                <textarea
                    rows={2} // qt de linah que o textarea exibi
                    placeholder='Tire sua dúvida!'
                    className='chat-input'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {

                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleMenssagem();
                        }
                    }}
                />

            </div>
        </div>
    );
}

