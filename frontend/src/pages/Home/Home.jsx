
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BoxRepo from "../../components/BoxRepo/Boxrepo";
import "./Home.css";
import api from "../../../services/api";

const getStoredOwner = () => {
  try {
    return sessionStorage.getItem('reposOwner') || "";
  } catch (err) {
    return "";
  }
};

const persistOwner = (value) => {
  try {
    if (value) {
      sessionStorage.setItem('reposOwner', value);
    } else {
      sessionStorage.removeItem('reposOwner');
    }
  } catch (err) {
    // ignore storage errors
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [owner, setOwner] = useState(() => getStoredOwner());
  const [ownerLoading, setOwnerLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || "");
  const urlToken = searchParams.get("token");
  const ownerRef = useRef(owner);
 

  const handleToken = async (token) => {
    try {
      const response = await api.post("/auth/checkToken", {
        token,
      })
      console.log("Token válido", response)
    } catch (error) {
      console.log("Erro ao validar token:", error);
      navigate("/login")
      localStorage.removeItem(authToken);
    }
  }

  useEffect(() => {
    let token = urlToken;

    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      token = localStorage.getItem("authToken");
      handleToken(token);
    }

    setAuthToken(token || "");


  }, [urlToken, navigate]);

  useEffect(()=>{
    let mounted = true;

    const fetchProfile = async () => {
      try {
        if (!authToken) {
          if (mounted) setOwnerLoading(false);
          return; // sem token não há profile
        }

        if (mounted) setOwnerLoading(true);
        const res = await api.get('/auth/profile');
        
        if (!mounted) return;
        const payload = res.data?.user ?? res.data ?? {};
        const username = (payload.usernameGit || payload.username || '').trim();
        if (username && username !== ownerRef.current) {
          ownerRef.current = username;
          setOwner(username);
          persistOwner(username);
          setRefreshKey((prev) => prev + 1);
        } else if (!username && ownerRef.current) {
          ownerRef.current = "";
          setOwner("");
          persistOwner("");
        }
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
        const username = (payload.usernameGit || payload.username || '').trim();
        if (mounted && username) {
          if (username !== ownerRef.current) {
            ownerRef.current = username;
            setOwner(username);
            persistOwner(username);
            setRefreshKey((prev) => prev + 1);
          }
          setOwnerLoading(false);
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
  }, [authToken]);

  return (
    <div className="Boxrepo">
      
      <div className="center">

        <BoxRepo owner={owner} refreshKey={refreshKey} ownerLoading={ownerLoading} />
      </div>
    </div>
  );
};

export default Home;