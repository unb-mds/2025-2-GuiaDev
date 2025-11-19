import React from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

export default function Modal({ isOpen, onClose, title = "Dialog", children }) {
    if (!isOpen) return null;

    function onBackdropClick(e) {
        if (e.target === e.currentTarget) onClose();
    }

    return createPortal(
        <div className="modal-backdrop" onClick={onBackdropClick}>
            <div className="modal-dialog">
                <div className="modal-header">

                    <div className="modal-firstLine">
                        <h2 className="modal-title">{title}</h2>
                        <button className="modal-close" onClick={onClose}>
                            <span className="span-x">x</span>
                        </button>
                    </div>
                        <h3 className="modal-msg">Gerencie as preferências da sua conta e aplicação</h3>
                </div>


                <div className="modal-content">
                    <h3 className="modal-title">Perfil</h3>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
