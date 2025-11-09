import React from 'react';
import "./Footer.css";

const Footer = () => (
    <footer>
        <div>
            <span style={{ color: "#fff" }}>
                &copy; {new Date().getFullYear()} GuiaDev. Desenvolvido para desenvolvedores, por desenvolvedores.
            </span>
            <a href="/documentacao" style={{ marginLeft: "24px", color: "#fff" }}>Documentação</a>
        </div>
    </footer>
);

export default Footer;
