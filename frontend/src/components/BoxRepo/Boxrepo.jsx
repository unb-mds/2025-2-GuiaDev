import React, { useState, useEffect } from "react";
import "./Boxrepo.css";
import GitHubAPI from "../../../services/github";
import { useNavigate } from "react-router-dom";


const BoxStat = ({ nome, num, comment }) => {
  return (
    <div className="box-item">
      <div className="name">
        {nome} 
      </div>

      <h2>{num}</h2>
      <p>{comment}</p>
    </div>
  );
};

const BoxRepositorio = ({ repo, owner }) => {
  const navigate = useNavigate();
  return (
    <div className="box-item-repo">
      <div>
        <h2>{repo.nomeRepositorio}</h2>
      </div>
      <button
        className="btn-details"
        onClick={() => navigate(`/analysis/${encodeURIComponent(owner)}/${encodeURIComponent(repo.nomeRepositorio)}`, { state: { repo } })}
      >
        Ver detalhes
      </button>
    </div>
  );
};



function BoxRepo({ owner }) {
  // 1. DOIS ESTADOS SEPARADOS: um para cada tipo de dado
  const [stats, setStats] = useState([]);
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

useEffect(() => {
  let alive = true;
  if (!owner) return;

  setError(null);
  setLoading(true);

  (async () => {
    try {
      const data = await GitHubAPI.analyzeUserRepos(owner);
      if (!alive) return;
      setRepos(Array.isArray(data) ? data : []);
    } catch (err) {
      if (!alive) return;
      setError("Erro ao pegar os repositórios");
      console.error(err);
    } finally {
      if (alive) setLoading(false);
    }
  })();

  return () => { alive = false; };
}, [owner]);
   

  return (
    
    <div className="box-repo-container">
      {/* --- PRIMEIRA SEÇÃO: DASHBOARD/ESTATÍSTICAS --- */}
      <div>
        <h1>Dashboard</h1>
        <br />
      </div>
      <h2>Acompanhe o progresso da documentação dos seus repositórios!</h2>
      <div className="scroll">
        <div className="boxes-list">
          {stats.length === 0 ? (
            <p>Carregando estatísticas...</p>
          ) : (
            // 3. RENDERIZAR USANDO O ESTADO 'stats'
            repos.map(() => (
              <BoxStat
                key={repos.id}
                nome={repos.nome}
                num={repos.num}
                comment={repos.comment}
                icon={repos.icon}
              />
            ))
          )}
        </div>
      </div>


      <div className="repo-section">
        <h1>Seus repositórios</h1>

        <div className="repo-scroll">
          <div className="boxes-list-repo" id="repo-list">
            {repos.length === 0 ? (
              <p>Carregando repositórios...</p>
            ) : (
              // 4. RENDERIZAR USANDO O ESTADO 'repos'
              repos.map((repo) => (
               <BoxRepositorio key={repo.id} repo={repo} owner={owner} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoxRepo;
