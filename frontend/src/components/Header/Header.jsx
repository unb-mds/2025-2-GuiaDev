import React, { useState } from "react";
import "./Header.css";
// import logo from "../../assets/Logo.svg";
import logoGuia from "../../assets/icone-guia-branco-512.png"

function Image() {
  return <img src={logoGuia} className="logo" alt="Logo do GuiaDev" />;
}

export default function Header() {
  return (
    <div className="box">
        <div>
      <header className="header">
        <Image></Image>
        <h1>GuiaDev</h1>
      </header>
      </div>
    </div>
  );
}
