import React, { useEffect, useState } from "react";
import "./Overview.css";
import commitIcon from "../../assets/commit.svg"
import userIcon from "../../assets/users.svg"
import docs from "../../assets/docs.svg"
import { useParams, useLocation } from 'react-router-dom';
import ProgressBar from "../Shared/ProgressBar";

const BoxRepoInfo = ({
  name,
  progress = 0,
  commits,
  contributors = 0,
  qtsArchive = 0,
  status = "Desconectado",
  languages = "-",
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

          {/* <div className="descripLang">Projeto desenvolvido em:{languages}</div> */}
        </div>
      </div>

          <ProgressBar value={progress} label="Progresso geral" />

      <div className="repoInfoBottom">
              <span>
            <img src={commitIcon}/>{commits} Commits
</span>
<span>
            <img src={userIcon}/>{contributors} Contribuidores </span>

       
      </div>
    </div>
  );
};

function Overview({repoObj}) {

  const params = useParams();
  const location = useLocation();

  const URLname = params.repo || location.state?.repo?.nomeRepositorio || 'Repositório';

 
  const docs = Array.isArray(repoObj)
    ? repoObj
    : Array.isArray(repoObj?.detalhes?.docs)
    ? repoObj.detalhes.docs
    : Array.isArray(repoObj?.docs)
    ? repoObj.docs   : [];

  const totalDocs = docs.length;
  const existsCount = docs.filter((d) => d.exists === true).length;
  const sumScore = docs.reduce((s, d) => s + (Number(d.score) || 0), 0);
  const avgScore = totalDocs > 0 ? Math.round(sumScore / totalDocs) : 0;

  const tryFromRepoObj = typeof repoObj === 'object' && repoObj !== null
    ? (Number(repoObj.commits ?? (Array.isArray(repoObj.ultimosCommits) ? repoObj.ultimosCommits.length : undefined)) || 0)
    : 0;
  const tryFromLocation = location.state?.repo && typeof location.state.repo === 'object'
    ? (Number(location.state.repo.commits ?? (Array.isArray(location.state.repo.ultimosCommits) ? location.state.repo.ultimosCommits.length : undefined)) || 0)
    : 0;

  const commitCount = tryFromRepoObj || tryFromLocation || 0;

  const aggregate = {
    id: URLname,
    name: URLname,
    progress: avgScore, 
    commits: commitCount, 
    contributors: '-', 
    qtsArchive: totalDocs,
    status: existsCount > 0 ? 'Ativo' : 'Desconectado',
    languages: '-',
  };

  return (
    <div className="allComponent">
      <BoxRepoInfo
        key={aggregate.id}
        name={aggregate.name}
        progress={aggregate.progress}
        commits={aggregate.commits}
        contributors={aggregate.contributors}
        qtsArchive={aggregate.qtsArchive}
        status={aggregate.status}
        languages={aggregate.languages}
      />
    </div>
  );
}

export default Overview;
