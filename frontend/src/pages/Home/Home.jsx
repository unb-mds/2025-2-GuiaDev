// src/pages/Home/Home.jsx

import { useNavigate } from "react-router-dom";
import BoxRepo from "../../components/BoxRepo/Boxrepo";
import "./Home.css";


const Home = () => {
  const navigate = useNavigate();


  // useEffect(() => {
  //   const token = sessionStorage.getItem("Token");
  //   if (!token) {
  //     navigate("/login"); // Exemplo: redireciona se não houver token
  //   }
  // }, [navigate]);

  return (

    <div className="Boxrepo">
      <BoxRepo />
    </div>
  );
};


export default Home;