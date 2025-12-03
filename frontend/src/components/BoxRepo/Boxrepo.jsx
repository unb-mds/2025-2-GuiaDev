import { useState, useEffect, useContext, useRef, useMemo } from "react";
import "./Boxrepo.css";
import api from "../../../services/api";
import ReposContext from "../../contexts/ReposContext";
import { useNavigate } from "react-router-dom";
import { IconRepositorios } from "../Sidebar/Sidebar";
import commitIcon from "../../assets/commit.svg";
import ProgressBar from "../Shared/ProgressBar";
import LoadingWave from "../WaveLoad/WaveLoad";
import warning from "../../assets/warning.svg"
import img from "../../assets/cat.png"
import img2 from "../../assets/gato.png"
import accept from "../../assets/accept.svg"

const ErroOwner = ({ owner }) => {
  return (
    <div className="erro-box">

      {!owner || owner.trim() === '' ? (
        <div className="erro-box">
          <span className="erroIcon">
            <img src={warning}></img>
          </span>

          <div className="erroMsg">
            <span>
              <p>Digite o username do GitHub no campo Username GitHub nas configurações para puxar os repositórios.</p>
            </span>

          </div>
        </div>) : (
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

      )}


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



function BoxRepo({ owner, refreshKey = 0, ownerLoading = false }) {

  const [stats, setStats] = useState([]);
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataOwner, setDataOwner] = useState('');
  const { reposByOwner, setReposForOwner } = useContext(ReposContext);
  const lastHandledRefreshKeyRef = useRef(refreshKey);
  const ownerTrimmed = useMemo(() => (
    typeof owner === 'string' ? owner.trim() : ''
  ), [owner]);


  useEffect(() => {
    let alive = true;
    const normalizedOwner = ownerTrimmed;
    const hasOwner = Boolean(normalizedOwner);

    if (!hasOwner) {
      setRepos([]);
      setStats([]);
      setError(null);
      setLoading(false);
      setDataOwner('');
      return () => { alive = false; };
    }

    let refreshTriggered = false;

    if (refreshKey !== lastHandledRefreshKeyRef.current) {
      refreshTriggered = true;
      lastHandledRefreshKeyRef.current = refreshKey;
    }

    const cachedRepos = reposByOwner?.[normalizedOwner];
    const cached = !refreshTriggered ? cachedRepos : null;

    setError(null);
    setLoading(true);

    if (cached) {
      setRepos(Array.isArray(cached) ? cached : []);
      setDataOwner(normalizedOwner);
      setLoading(false);
      return () => { alive = false; };
    }

    (async () => {
      try {
        const res = await api.get(`github/analyze/user/${encodeURIComponent(normalizedOwner)}`);
        if (!alive) return;
        const data = res?.data ?? [];
        const nextRepos = Array.isArray(data) ? data : [];
        setRepos(nextRepos);
        setDataOwner(normalizedOwner);

        if (setReposForOwner) setReposForOwner(normalizedOwner, nextRepos);
      } catch (err) {
        if (!alive) return;
        setError("Erro ao pegar os repositórios");
        console.error(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [ownerTrimmed, refreshKey, reposByOwner, setReposForOwner]);


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

    const perfectScoreCount = repos.reduce((count, r) => {
      const score = Number(r?.score);
      return Number.isFinite(score) && score === 100 ? count + 1 : count;
    }, 0);

    const statsArr = [
      { id: 'repos', icon: <IconRepositorios className="repo-icon" />, nome: 'Repositórios', num: repoCount, comment: 'Total de repositórios analisados' },
      { id: 'commits', icon: <img src={commitIcon} className="commit-icon" alt="Commits" />, nome: 'Commits Total', num: totalCommits, comment: 'Total de commits em todos os repositórios' },
      { id: 'perfect-score', icon: <img src={accept} />, nome: 'Score 100', num: perfectScoreCount, comment: 'Repositórios com score máximo' },
    ];

    setStats(statsArr);
  }, [repos]);


  useEffect(() => {
    console.log('repoObj (debug):', repos);
  }, [repos]);



  const pendingOwnerData = Boolean(ownerTrimmed) && ownerTrimmed !== dataOwner;
  const shouldShowLoading = ownerLoading || loading || pendingOwnerData;

  return (
    <div className="box-repo-container">
      {shouldShowLoading ? (
        <LoadingWave owner={ownerTrimmed} />
      ) : (
        <>
          {repos.length === 0 && !shouldShowLoading ? (
            <div className="erro-container">
              <div className="erro-component">
                <ErroOwner owner={ownerTrimmed} />
              </div>
              {!ownerTrimmed ? (
                <span>
                  <img src={img2} className="img" />
                </span>
              ) : (
                <span>
                  <img src={img} className="img" />
                </span>)}
            </div>
          ) : (
            <div>
              <div className="dashboard-header">
                <div>
                  <h1>Dashboard</h1>
                  <br />
                  <h2>Acompanhe o progresso da documentação dos seus repositórios!</h2>
                </div>
                
  
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
                    {repos.length === 0 || !ownerTrimmed ? (
                      <span className="empty-placeholder">
                        <p>Nenhum repositório encontrado para "{ownerTrimmed}". Verifique o nome e tente novamente.</p>
                      </span>
                    ) : (
                      repos.map((repo) => (
                        <BoxRepositorio
                          key={repo.id}
                          repo={repo}
                          owner={ownerTrimmed}
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
