
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BoxRepo from "../../components/BoxRepo/Boxrepo";
import "./Home.css";
import api from "../../../services/api";

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [owner, setOwner] = useState("");
  const urlToken = searchParams.get("token");
 

  const handleToken = async (token) => {
    try {
      const response = await api.post("/auth/checkToken", {
        token,
      })
      console.log("Token válido", response)
    } catch (error) {
      console.log("Erro ao validar token:", error);
    }
  }

  useEffect(() => {
    let token = urlToken;

    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      token = localStorage.getItem("authToken");
    }

    // se ainda não houver token, redireciona pro login
    if (!token) {
      navigate("/login");
    } else {
      handleToken(token);
    }

  }, [urlToken, navigate]);

  useEffect(()=>{
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return; // sem token não há profile

        const res = await api.get('/auth/profile');
        if (!mounted) return;
        const payload = res.data?.user ?? res.data ?? {};
        const username = payload.usernameGit || payload.username || '';
        if (username) setOwner(username);
      } catch (err) {
        console.error('Falha ao obter perfil:', err);
      }
    };

    fetchProfile();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="Boxrepo">
      <div className="center">
        {!owner && (
          <div className="home-notice" style={{ marginBottom: 16, textAlign: 'center' }}>
            <strong>Digite o username do GitHub no campo Username GitHub nas configurações para puxar os repositórios.</strong>
          </div>
        )}

        <BoxRepo owner={owner} />
      </div>
    </div>
  );
};

export default Home;