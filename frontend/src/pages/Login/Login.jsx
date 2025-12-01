import React from 'react';
import "./Login.css";
import Footer from "../../components/Footer/Footer";
import iconeFoguete from "../../assets/icone-foguete.png"
import iconeLivro from "../../assets/icone-livro.png"
import iconeAnalise from "../../assets/icone-analise.png"


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
              <img src={iconeFoguete} alt="icone foguete" /><strong> Área exclusiva de aprendizado</strong>
            </li>
            <li>
              <img src={iconeAnalise} alt="icone analise" /><strong>Análise de projetos reais com IA</strong>
            </li>
            <li>
              <img src={iconeLivro} alt="icone livro" /><strong>Recursos exclusivos</strong>
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
