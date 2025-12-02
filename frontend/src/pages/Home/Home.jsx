
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BoxRepo from "../../components/BoxRepo/Boxrepo";
import "./Home.css";
import api from "../../../services/api";

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [owner, setOwner] = useState("");
  const [ownerLoading, setOwnerLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
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
        if (!token) {
          if (mounted) setOwnerLoading(false);
          return; // sem token não há profile
        }

        if (mounted) setOwnerLoading(true);
        const res = await api.get('/auth/profile');
        
        if (!mounted) return;
        const payload = res.data?.user ?? res.data ?? {};
        const username = payload.usernameGit || payload.username || '';
        if (username) setOwner(username);
        setOwnerLoading(false);
      } catch (err) {
        console.error('Falha ao obter perfil:', err);
        if (mounted) setOwnerLoading(false);
      }
    };

    fetchProfile();
    // listen for profile updates from the Config modal and update owner live
    const onProfileUpdated = (ev) => {
      try {
        const payload = ev?.detail ?? {};
        const username = payload.usernameGit || payload.username || '';
        if (mounted) {
          if (typeof username === 'string') {
            setOwner(username);
          }
          setOwnerLoading(false);
          setRefreshKey((prev) => prev + 1);
        }
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('profileUpdated', onProfileUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('profileUpdated', onProfileUpdated);
    };
  }, []);

  return (
    <div className="Boxrepo">
      
      <div className="center">

        <BoxRepo owner={owner} refreshKey={refreshKey} ownerLoading={ownerLoading} />
      </div>
    </div>
  );
};

export default Home;