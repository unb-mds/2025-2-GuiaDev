// src/pages/Home/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BoxRepo from "../../components/BoxRepo/Boxrepo";
import "./Home.css";
// import GitHubAPI from "../../../services/github";

const Home = () => {
  const navigate = useNavigate();

  const [ownerInput, setOwnerInput] = useState("");
  const [owner, setOwner] = useState("");

  const [search, setSearch] = useState(false);
  // const [repo, setRepos] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken"); // Corrigido para usar a mesma chave
    if (token) {
      navigate("/login"); // Exemplo: redireciona se não houver token
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();                // evita reload
    const clean = ownerInput.trim();
    if (!clean) return;                // evita submit vazio
    setOwner(clean);                   // congela o valor p/ BoxRepo
  };

  return (
    <div className="Boxrepo">
      <div className="inputLink">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username (GitHub)"
            value={ownerInput}
            onChange={(e) => setOwnerInput(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>
      </div>

      <div className="center">
       
        <BoxRepo owner={owner}/>
      </div>
    </div>
  );
};

export default Home;