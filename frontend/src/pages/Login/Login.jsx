
import React from 'react';
import "./Login.css";
import Footer from "../../components/Footer/Footer";


import Sign_in from "../../components/Sign-in/Sign-in";

export default function Login() {


  return (
    <div className="login-page">
      <div className="content">
        <div className="content-left">
          <h1>
            Bem-Vindo ao <span>GuiaDev</span>
          </h1>
          <p style={{ marginTop: "-0.5em" }}>
            <strong>
              Sua plataforma completa para desenvolvimento profissional
            </strong>
          </p>
          <ul>
            <li>
              <strong>🚀 Acelere seu aprendizado</strong>
            </li>
            <li>
              <strong>👥 Conecte-se com devs</strong>
            </li>
            <li>
              <strong>📖 Recursos exclusivos</strong>
            </li>
          </ul>
        </div>

        <div className="content-right">
          <Sign_in />
        </div>
      </div>
      <Footer />
    </div>
  );
}
