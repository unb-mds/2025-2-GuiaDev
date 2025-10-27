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
  
  const [ownerInput, setOwnerInput] = useState("");
  const [owner, setOwner] = useState("");

  const [search, setSearch] = useState(false);
  // const [repo, setRepos] = useState("");

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