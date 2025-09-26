import React from 'react';
import "./Footer.css";

const Footer = () => (
    <footer>
        <div>
            <span style={{ color: "#fff" }}>
                &copy; {new Date().getFullYear()} GuiaDev. Desenvolvido para desenvolvedores, por desenvolvedores.
            </span>
            <a href="/suporte" style={{ marginLeft: "300px", color: "#fff" }}>Suporte</a>
            <a href="/documentacao" style={{ marginLeft: "24px", color: "#fff" }}>Documentação</a>
            <a href="/comunidade" style={{ marginLeft: "24px", color: "#fff" }}>Comunidade</a>
        </div>
    </footer>
);

export default Footer;
