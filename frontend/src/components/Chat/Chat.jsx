import React from 'react';
import './Chat.css';

export default function Chat() {

    return (
        <div className='chat-box'>
            <div className='chat-messages'>
                <p className='chat-placeholder'>GuiaDev Chat Box</p>
            </div>
            <div className='chat-input-area'>
            
                <input 
                type="text" 
                placeholder='Tire sua dúvida!'
                className='chat-input'
                />
                
            </div>
        </div>
    );
}

