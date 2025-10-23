// src/pages/Home/Home.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BoxRepo from "../../components/BoxRepo/Boxrepo";
import "./Home.css";
import api from "../../../services/api";

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get("token");

  const handleToken = async (token)=>{
    try{
      const response = await api.post("/auth/checkToken",{
        token,
      })
      console.log("Token válido", response)
    } catch(error) {
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
    } else{
      handleToken(token);
    }
  
  }, [urlToken, navigate]);

  return (
    <div className="Boxrepo">
      <div>
        <BoxRepo />
      </div>
    </div>
  );
};

export default Home;