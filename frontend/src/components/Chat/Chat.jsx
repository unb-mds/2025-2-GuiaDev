import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';

export default function Chat() {
    const [messages, setMessagens] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const handleMenssagem = () => {
        if (input.trim() === '') return;

        setMessagens((prev) => [...prev, { text: input, sender: 'user' }]);
        setInput('');
    };

   
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages]);

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
                            <div className='msg'>
                                {msg.text}
                            </div>
                        </div>
                    ))
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

