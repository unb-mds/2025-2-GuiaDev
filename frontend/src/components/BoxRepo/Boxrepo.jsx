import React, { useState, useEffect, useContext } from "react";
import "./Boxrepo.css";
import api from "../../../services/api";
import ReposContext from "../../contexts/ReposContext";
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
  const { getReposForOwner, setReposForOwner } = useContext(ReposContext);


  useEffect(() => {
    if (!Array.isArray(repos) || repos.length === 0) {
      setStats([]);
      return;
    }

    const repoCount = repos.length;
 
    const totalCommits = repos.reduce((sum, r) => {
      const n = Number(r?.commits ?? 0);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);

    const statsArr = [
      { id: 'repos', nome: 'Repositórios', num: repoCount, comment: 'Total de repositórios analisados' },
      { id: 'commits', nome: 'Commits Total', num: totalCommits, comment: 'Total de commits em todos os repositórios' },
      { id: 'placeholder', nome: 'Outro', num: 0, comment: 'Estatística adicional (a definir)' },
    ];

    setStats(statsArr);
  }, [repos]);

useEffect(() => {
  let alive = true;
  if (!owner) return;
  const cached = getReposForOwner ? getReposForOwner(owner) : null;

  setError(null);
  setLoading(true);

  if (cached) {
    setRepos(Array.isArray(cached) ? cached : []);
    setLoading(false);
    return () => { alive = false; };
  }

  (async () => {
    try {
      const res = await api.get(`github/analyze/user/${encodeURIComponent(owner)}`);
      if (!alive) return;
      const data = res?.data ?? [];
      setRepos(Array.isArray(data) ? data : []);
      // store in context cache
      if (setReposForOwner) setReposForOwner(owner, Array.isArray(data) ? data : []);
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
   

useEffect(() => {
  console.log('repoObj (debug):', repos);
}, [repos]);

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
          {!owner ? (
            <p>Username do GitHub não identificado!</p>
          ) : loading ? (
            <p>Buscando repositórios de "{owner}"...</p>
          ) : stats.length === 0 ? (
            <p>Ainda não há estatísticas disponíveis para este usuário.</p>
          ) : (
            // 3. RENDERIZAR USANDO O ESTADO 'stats'
            stats.map((s) => (
              <BoxStat
                key={s.id}
                nome={s.nome}
                num={s.num}
                comment={s.comment}
                icon={s.icon}
              />
            ))
          )}
        </div>
      </div>


      <div className="repo-section">
        <h1>Seus repositórios</h1>

        <div className="repo-scroll">
          <div className="boxes-list-repo" id="repo-list">
            {!owner ? (
              <span className="empty-placeholder">
                <p>Username do GitHub não identificado!</p>
              </span>
            ) : loading ? (
              <span className="empty-placeholder">
                <p>Buscando repositórios de "{owner}"...</p>
              </span>
            ) : repos.length === 0 ? (
              <span className="empty-placeholder">
                <p>Nenhum repositório encontrado para "{owner}". Verifique o nome e tente novamente.</p>
              </span>
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
