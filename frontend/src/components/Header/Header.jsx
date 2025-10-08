import React, { useState } from "react";
import "./Header.css";
import logo from "../../assets/Logo.svg";

function Image() {
  return <img src={logo} className="logo" alt="Logo do GuiaDev" />;
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
