import React, { useState, useEffect } from "react";
import "./Boxrepo.css";
import { useRepos } from "../../hooks/useRepos";

// --- Seus Componentes de Caixa (estão ótimos) ---

const BoxStat = ({ nome, num, comment }) => {
  return (
    <div className="box-item">
      <div className="name">
        {nome} {/* Usei <p> para o título para melhor semântica */}
      </div>

      <h2>{num}</h2>
      <p>{comment}</p>
    </div>
  );
};

const BoxRepositorio = ({ nome }) => {
  return (
    <div className="box-item-repo">
      <div>
        <h2>{nome}</h2>
      </div>
      <div className="info">Ver detalhes</div>
    </div>
  );
};

// --- Seu Componente Principal Corrigido ---

function BoxRepo() {
  // 1. DOIS ESTADOS SEPARADOS: um para cada tipo de dado
  const [stats, setStats] = useState([]);
  const [repos, setRepos] = useState([]);
  // projectId pode vir de props/rota
  const projectId = "demo";
  const {
    repos: backendRepos,
    loading: reposLoading,
    error: reposError,
  } = useRepos(projectId);

  useEffect(() => {
    // --- SIMULAÇÃO DE UMA CHAMADA AO BACKEND ---

    // Dados para a primeira seção (Resumo/Estatísticas)
    const dadosStatsDoBackend = [
      {
        id: "stat-1",
        nome: "Repositórios",
        num: "12",
        comment: "Total conectado.",
      },
      {
        id: "stat-2",
        nome: "Completos",
        num: "14",
        comment: "Bem documentados.",
      },
      {
        id: "stat-3",
        nome: "Pendentes",
        num: "5",
        comment: "Precisam de atenção.",
      },
    ];

    // Dados para a segunda seção (Lista de Repositórios)
    const dadosReposDoBackend = [
      { id: "repo-a", nome: "react-dashboard" },
      { id: "repo-b", nome: "api-gateway" },
      { id: "repo-c", nome: "mobile-app" },
      { id: "repo-d", nome: "data-pipeline" },
      { id: "repo-e", nome: "auth-service" },
      { id: "repo-f", nome: "docs-site" },
      { id: "repo-g", nome: "cli-tool" },
      { id: "repo-h", nome: "analytics" },
      { id: "repo-i", nome: "integration-tests" },
    ];

    // Simulamos um pequeno delay para a chegada dos dados
    const timer = setTimeout(() => {
      // 2. ATUALIZAR CADA ESTADO COM SEUS DADOS CORRESPONDENTES
      setStats(dadosStatsDoBackend);
      setRepos(dadosReposDoBackend);
    }, 1000); // 1 segundo de delay

    return () => clearTimeout(timer);
  }, []); // O array vazio [] garante que rode só uma vez

  // Substitui os dados simulados pelos dados do backend quando disponíveis
  useEffect(() => {
    if (
      !reposLoading &&
      !reposError &&
      backendRepos &&
      backendRepos.length > 0
    ) {
      setRepos(backendRepos);
    }
  }, [backendRepos, reposLoading, reposError]);

  /*
    Quando o backend estiver pronto, substitua a simulação por um hook:

    // import { useRepos } from '../../hooks/useRepos';
    // const { repos, loading } = useRepos(projectId);

    E use os dados retornados em vez de stats/repos simulados.
  */

  return (
    // Um único div container para a página é suficiente
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
            stats.map((stat) => (
              <BoxStat
                key={stat.id}
                nome={stat.nome}
                num={stat.num}
                comment={stat.comment}
                icon={stat.icon}
              />
            ))
          )}
        </div>
      </div>

      {/* --- SEGUNDA SEÇÃO: SEUS REPOSITÓRIOS --- */}
      <div className="repo-section">
        <h1>Seus repositórios</h1>
        {/* Container with vertical scroll when content exceeds max-height */}
        <div className="repo-scroll">
          <div className="boxes-list-repo" id="repo-list">
            {repos.length === 0 ? (
              <p>Carregando repositórios...</p>
            ) : (
              // 4. RENDERIZAR USANDO O ESTADO 'repos'
              repos.map((repo) => (
                <BoxRepositorio key={repo.id} nome={repo.nome} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoxRepo;
