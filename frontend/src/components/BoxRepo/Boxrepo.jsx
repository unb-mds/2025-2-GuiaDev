import  { useState, useEffect, useContext} from "react";
import "./Boxrepo.css";
import api from "../../../services/api";
import ReposContext from "../../contexts/ReposContext";
import { useNavigate } from "react-router-dom";
import { IconRepositorios } from "../Sidebar/Sidebar";
import commitIcon from "../../assets/commit.svg";
import ProgressBar from "../Shared/ProgressBar";
import LoadingWave from "../WaveLoad/WaveLoad";
import warning from "../../assets/warning.svg"

const ErroOwner = ({owner}) =>{
  return (
  <div className="erro-box">
    <span className="erroIcon">
    <img src={warning}></img>
    </span>

    <div className="erroMsg">
    <span>
      <p>Ops! Não conseguimos localizar este perfil.</p>
      <p>Parece que o nome de usuário: <u>{owner}</u> está incorreto ou o perfil não existe.</p>
    </span>
     
    </div>
    
  </div>
);
}

const BoxStat = ({ icon, nome, num, comment }) => {
  return (
    <div className="box-item">
      <div className="name">
        <div className="stat-icon">
          {icon}
        </div>
        {nome}
      </div>

      <h2>{num}</h2>
      <p>{comment}</p>
    </div>
  );
};

const BoxRepositorio = ({ repo, owner }) => {
  const navigate = useNavigate();

  const docs = Array.isArray(repo)
    ? repo
    : Array.isArray(repo?.detalhes?.docs)
      ? repo.detalhes.docs
      : Array.isArray(repo?.docs)
        ? repo.docs
        : [];


  const totalDocs = docs.length;
  const sumScore = docs.reduce((s, d) => s + (Number(d.score) || 0), 0);
  const avgScore = totalDocs > 0 ? Math.round(sumScore / totalDocs) : 0;

  const progressValue = (repo && repo.score !== undefined && repo.score !== null)
    ? Number(repo.score)
    : -1;
  return (
    <div className="box-item-repo">

      <div>
        <h2>{repo.nomeRepositorio}</h2>
      </div>
      <div className="Boxrepo-bottomBox">
        <div className="Boxrepo-barProgress">
          <span>
            <ProgressBar value={progressValue} />
          </span>
        </div>

        <button
          className="btn-details"
          onClick={() => navigate(`/analysis/${encodeURIComponent(owner)}/${encodeURIComponent(repo.nomeRepositorio)}`, { state: { repo } })}
        >
          Ver detalhes
        </button>
      </div>
    </div>
  );
};



function BoxRepo({ owner }) {

  const [stats, setStats] = useState([]);
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { getReposForOwner, setReposForOwner } = useContext(ReposContext);

const [test, setTESTE] = useState(false);

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
        const res = await api.get(`git-hub/analyze/user/${encodeURIComponent(owner)}`);
        if (!alive) return;
        const data = res?.data ?? [];
        setRepos(Array.isArray(data) ? data : []);
 
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
      { id: 'repos', icon: <IconRepositorios className="repo-icon" />, nome: 'Repositórios', num: repoCount, comment: 'Total de repositórios analisados' },
      { id: 'commits', icon: <img src={commitIcon} className="commit-icon" alt="Commits" />, nome: 'Commits Total', num: totalCommits, comment: 'Total de commits em todos os repositórios' },
      { id: 'placeholder', nome: 'Outro', num: 0, comment: 'Estatística adicional (a definir)' },
    ];

    setStats(statsArr);
  }, [repos]);


  useEffect(() => {
    console.log('repoObj (debug):', repos);
  }, [repos]);

return (
    <div className="box-repo-container">
      
    
      {loading ? (
        <LoadingWave owner={owner} />
      ) : (
        
        <>
       
          {!test ? (
            <div className="erro-container">
              <div className="erro-component">
                <ErroOwner owner={owner}/>
              </div>
              
            </div>
            
          ) : (
         
            <div>
              <div className="dashboard-header">
                <div>
                  <h1>Dashboard</h1>
                  <br />
                </div>
                <h2>Acompanhe o progresso da documentação dos seus repositórios!</h2>
              </div>

              <div className="scroll">
                <div className="boxes-list">
                  
                  {stats && stats.map((s) => (
                    <BoxStat
                      key={s.id}
                      nome={s.nome}
                      num={s.num}
                      comment={s.comment}
                      icon={s.icon}
                    />
                  ))}
                </div>
              </div>

         
              <div className="repo-section">
                <h1>Seus repositórios</h1>

                <div className="repo-scroll">
                  <div className="boxes-list-repo" id="repo-list">
                    {repos.length === 0 ? (
                      <span className="empty-placeholder">
                        <p>Nenhum repositório encontrado para "{owner}". Verifique o nome e tente novamente.</p>
                      </span>
                    ) : (
                      repos.map((repo) => (
                        <BoxRepositorio 
                          key={repo.id} 
                          repo={repo} 
                          owner={owner} 
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BoxRepo;
