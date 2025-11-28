import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import api from "../../../services/api";

import "./Register.css";

function Register({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [senha, setSenha] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/register", {
        email: email,
        name: name,
        lastName: lastName,
        password: senha,
      });

      console.log("Usuário criado:", response.data);
      alert("Cadastro realizado com sucesso! Agora você pode fazer login.");

      // Volta para o login após cadastro bem-sucedido
      onSwitchToLogin();
    } catch (err) {
      console.error("Erro no cadastro:", err);
      alert("Erro ao criar conta. Tente novamente.");
    }
  };
  return (
    <div className="register-box">
      <div className="tabs">
        <button onClick={onSwitchToLogin}>Entrar</button>
        <button className="active">Cadastro</button>
      </div>
      <h2>Criar sua conta</h2>
      <p className="subtitle">Junte-se à comunidade de desenvolvedores</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="name-input">Nome</label>
        <input
          id="name-input"
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label htmlFor="sobrenome-input">Sobrenome</label>
        <input
          id="sobrenome-input"
          type="text"
          placeholder="Seu sobrenome"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <label htmlFor="email-input">E-mail</label>
        <input
          id="email-input"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="senha-input">Senha</label>
        <input
          id="senha-input"
          type="password"
          placeholder="**********"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <hr className="register-divider"></hr>

        <button type="submit" className="btn-cadastrar">
          Criar Conta
        </button>
      </form>
    </div>
  );
}

export default Register;
