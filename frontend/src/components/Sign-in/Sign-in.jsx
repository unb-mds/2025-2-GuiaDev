import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import api from "../../../services/api";

import Register from "../Register/Register";
import "./Sign-in.css";

function Sign_in() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const navigate = useNavigate();

  // const handleGithubLogin = async () => {

  //   try {
  //     const response = await api.get("/auth/github");

  //     // if (response.data.access_token) {
  //     //   localStorage.setItem("authToken", response.data.access_token);
  //     //   console.log("Token GitHub: ", response.data.access_token);
  //     //   navigate("/home");
  //     // } else if (response.data.redirect_url) {
  //     //   // Se o backend retornar URL de redirecionamento OAuth
  //     //   window.location.href = response.data.redirect_url;
  //     // }
  //   } catch (err) {
  //     console.error("Erro no login GitHub:", err);
  //     alert("Erro ao fazer login com GitHub. Tente novamente.");
  //   }
  // };

  // React
const handleGithubLogin = () => {
  window.open('http://localhost:3000/auth/github', '_self'); // ou '_blank'

};


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email: email,
        password: senha, // Corrigido para 'password'
      });

      const { access_token } = response.data; // Corrigido para 'access_token'

      localStorage.setItem("authToken", access_token);
      console.log("Token salvo:", access_token);
      console.log("Redirecionando para /home");

      navigate("/home");
    } catch (err) {
      console.error("Erro no login:", err);
      alert("E-mail ou senha inválidos. Tente novamente.");
    }
  };

  if (isRegistering) {
    return <Register onSwitchToLogin={() => setIsRegistering(false)} />;
  }

  return (
    <div className="login-box">
      <div className="tabs">
        <button className="active">Entrar</button>
        <button onClick={() => setIsRegistering(true)}>Cadastro</button>
      </div>
      <h2>Entrar na sua conta</h2>
      <p className="subtitle">Acesse sua jornada de desenvolvedor</p>

      <form onSubmit={handleSubmit}>
        <label>E-mail</label>
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Senha</label>
        <input
          type="password"
          placeholder="**********"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <div className="options">
          <label>
            <input type="checkbox" /> Lembrar de mim
          </label>
          <a href="#">Esqueci minha senha</a>
        </div>
        <button type="submit" className="btn-entrar">
          Entrar
        </button>
      </form>
      <div className="divider">ou continue com</div>

      <div className="social-login">
        <button className="btn-social google">
          <i className="fab fa-google social-icon"></i>
          Google
        </button>
        <button className="btn-social github" onClick={() => handleGithubLogin()}>
          <i className="fab fa-github social-icon"></i>
          GitHub
        </button>
      </div>
    </div>
  );
}

export default Sign_in;
