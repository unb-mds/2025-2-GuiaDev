import React, { useEffect, useState } from "react";
import "./Overview.css";
import { useRepos } from "../../hooks/useRepos";
import branchIcon from "../../assets/branch.svg"
import userIcon from "../../assets/users.svg"
import docs from "../../assets/docs.svg"
/*
  Para consumir dados do backend, crie/ative um hook `useOverview` ou use os hooks
  individuais (`useMetrics`, `useSummary`, `useRepos`) e substitua o `apiFake`.

  Exemplo (comentar/descomentar quando o backend estiver pronto):
  // import { useOverview } from '../../hooks/useOverview';
  // const { data, loading } = useOverview(projectId);
*/

const BoxRepoInfo = ({
  name,
  progress,
  branch,
  contributors,
  qtsArchive,
  status,
  languages,
}) => {
  // barra de progresso
  const pct =
    typeof progress === "string"
      ? parseInt(progress, 10) || 0
      : Math.round(progress || 0);
  const pctClamped = Math.min(100, Math.max(0, pct));

  return (
    <div className="repoInfo">
      <div className="repoText">
        <div className="firstPart">
          <div className="firstLine">
            <div className="repoName">{name}</div>

            <div
              className={`status ${
                status === "Ativo" ? "Ativo" : "Desconectado"
              }`}
            >
              {status === "Ativo" ? "Ativo" : "Desconectado"}
              {/* //ativo ou desativo */}
            </div>
          </div>

          <div className="descripLang">Projeto desenvolvido em:{languages}</div>
        </div>
      </div>

      <div className="progress">
        <div className="progress-label">
          <span>Progresso geral:</span> <span>{pctClamped}%</span>
        </div>

        <div
          className="progress-bar"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={pctClamped}
        >
          <div className="progress-fill" style={{ width: `${pctClamped}%` }} />
        </div>
      </div>

      <div className="repoInfoBottom">
              <span>
            <img src={branchIcon}/>{branch} Branches
</span>
<span>
            <img src={userIcon}/>{contributors} Contribuidores </span>
<span>

            <img src={docs}/>{qtsArchive} Arquivos totais
</span>
       
      </div>
    </div>
  );
};

function Overview() {
  // projectId pode vir de props/rota; mantive como 'demo' enquanto integra
  const projectId = "demo";
  const { repos, loading, error } = useRepos(projectId);

  const [repoInfo, setRepoInfo] = useState([]);

  useEffect(() => {
    // dados de fallback (simulação) para desenvolvimento offline
    const apiFake = [
      {
        id: "1",
        name: "Repo-a",
        progress: "85%",
        branch: "3",
        contributors: "5",
        qtsArchive: "15",
        status: "Ativo",
        languages: " React e Type",
      },
    ];
    // se o backend estiver carregando ou falhar, use o mock para manter a UI visível
    if (loading || error || !repos || repos.length === 0) {
      setRepoInfo(apiFake);
    } else {
      setRepoInfo(repos);
    }
  }, [loading, error, repos]);

  return (
    <div className="allComponent">
      {repoInfo.map((repo) => (
        <BoxRepoInfo key={repo.id} {...repo} />
      ))}
    </div>
  );
}

export default Overview;
