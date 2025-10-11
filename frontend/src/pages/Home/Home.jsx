// src/pages/Home/Home.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BoxRepo from "../../components/BoxRepo/Boxrepo";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken"); // Corrigido para usar a mesma chave
    if (!token) {
      navigate("/login"); // Exemplo: redireciona se não houver token
    }
  }, [navigate]);

  return (
    <div className="Boxrepo">
      <div>
      <BoxRepo />
      </div>
    </div>
  );
};

export default Home;
