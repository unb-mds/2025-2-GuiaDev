import React from 'react';
import "./Footer.css";

const Footer = () => (
    <footer>
        <div>
            <span style={{ color: "#fff" }}>
                &copy; {new Date().getFullYear()} GuiaDev. Desenvolvido para desenvolvedores, por desenvolvedores.
            </span>
            <a href="https://unb-mds.github.io/2025-2-GuiaDev/" style={{ marginLeft: "24px", color: "#fff" }} target='_blank'>Documentação</a>
        </div>
    </footer>
);

export default Footer;
