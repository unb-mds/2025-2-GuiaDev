import React, { useState, useEffect, useMemo } from "react";
import "./Details.css";
import FileTree from "../FileTree/FileTree";
import warning from "../../assets/warning.svg";
import { useParams, useLocation } from 'react-router-dom';
import { buildTreeWithDocs } from "../../utils/tree";
import api from "../../../services/api";

const treeCache = new Map();

const IssuesDocs = ({ suggestion, fileName }) => {
  const items = Array.isArray(suggestion) ? suggestion : suggestion ? [suggestion] : [];
  return (
    <div className="issueBody">
      <div className="issuePath">{fileName || "(arquivo)"}</div>
      <ul className="issuePoints">
        {items.length > 0 ? (
          items.map((s, i) => <li key={i}>{s}</li>)
        ) : (
          <li>Sem sugestões</li>
        )}
      </ul>
    </div>
  );
};

const Details = ({ repoObj, repo }) => {

    const params = useParams();        // { owner, repo }
    const location = useLocation(); 

  const [treeEntries, setTreeEntries] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState({ open: false, name: null, content: null });

  useEffect(() => {
    let alive = true;

    async function gitAPITree() {
      const currentRepoName = repo?.nomeRepositorio || repo?.repo || repo || params?.repo || location.state?.repo?.nomeRepositorio;
      if (!currentRepoName && !params?.repo) {
        setTreeEntries([]);
        return;
      }


      const effectiveOwner = params.owner;
      const repoName = params.repo || currentRepoName || location.state?.repo?.nomeRepositorio;

      if (!effectiveOwner || !repoName) {
        setTreeEntries([]);
        return;
      }

      const cacheKey = `${effectiveOwner}/${repoName}`;
      const cachedTree = treeCache.get(cacheKey);
      if (cachedTree) {
        setTreeEntries(cachedTree);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`github/tree/${encodeURIComponent(effectiveOwner)}/${encodeURIComponent(repoName)}`);
        if (!alive) return;
        const pathData = res && res.data ? res.data : [];
        const normalized = Array.isArray(pathData) ? pathData : [];
        treeCache.set(cacheKey, normalized);
        setTreeEntries(normalized);
      } catch (err) {
        console.error("Erro ao buscar o tree", err);
        if (!alive) return;
        setError("Erro ao buscar estrutura do repositório");
        setTreeEntries([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    gitAPITree();
    return () => {alive = false; };
  }, [repo, params?.owner, params?.repo, location?.state?.repo]);



  const docs = repoObj || repo || null;

  const tree = useMemo(() => {
    if (treeEntries === null) return [];
    return buildTreeWithDocs(treeEntries, docs);
  }, [treeEntries, docs]);

  function handleFileClick(node) {
    if (node?.meta?.doc) {
      setPreview({
        open: true,
        name: node.meta.doc.name || node.name,
        content: node.meta.doc.content || node.meta.doc.contentRaw || null
      });
      return;
    }
    
    console.log('Arquivo sem doc clicado:', node.path);
  }

  const suggestionsFix = Array.isArray(repoObj) ? repoObj : Array.isArray(repo) ? repo : [];

  return (
    <div className="analysisDetails">
      <div className="structerProject">
        <h4>Estrutura de arquivos</h4>
        <FileTree tree={tree} onFileClick={handleFileClick} />
      </div>

      <div className="issuesList">
        <h4>Arquivos com Problemas</h4>
        {suggestionsFix.map((d) => ( d.score === 100? '':(
          <div className="issueCard" key={d.id ?? d.name}>
            <div className="issueIcon">
              <img src={warning} alt="aviso" />
            </div>
            <IssuesDocs suggestion={d.suggestions} fileName={d.name} />
          </div>) 
        ))}

      </div>
    </div>
  );
};

export default Details;
