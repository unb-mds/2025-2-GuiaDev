import React, { useState, useEffect, useMemo } from "react";
import "./Details.css";
import FileTree from "../FileTree/FileTree";
import warning from "../../assets/warning.svg";
import { useParams } from 'react-router-dom';
import { buildTreeWithDocs } from "../../utils/tree";
import GitHubAPI from "../../../services/github";


const Details = ({ owner, repo }) => {

  const params = useParams();

  const [treeEntries, setTreeEntries] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState({ open: false, name: null, content: null });

  useEffect(() => {
    let alive = true;

    async function gitAPITree() {
      if (!repo && !params?.repo) {
        setTreeEntries([]);
        return;
      }

      
      const effectiveOwner = owner || params?.owner || repo?.owner?.login || repo?.owner || null;
      const repoName = repo?.nomeRepositorio || repo?.repo || repo?.name || params?.repo || null;

      if (!effectiveOwner || !repoName) {
        setTreeEntries([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const path = await GitHubAPI.getRepoTree(effectiveOwner, repoName);
        if (!alive) return;
        setTreeEntries(Array.isArray(path) ? path : []);
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
  }, [repo]);



  const docs = repo?.detalhes?.docs || repo?.docsContent || repo?.docs || [];

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
    // arquivo sem doc: comportamento opcional (poderia buscar blob via endpoint)
    console.log('Arquivo sem doc clicado:', node.path);
  }
  return (
    <div className="analysisDetails">
      <div className="structerProject">
        <h4>Estrutura de arquivos</h4>
        <FileTree tree={tree} onFileClick={handleFileClick} />
      </div>

      <div className="issuesList">
        <h4>Arquivos com Problemas</h4>
        <div className="issueCard">
          <div className="issueIcon">
            <img src={warning} alt="aviso" />
          </div>
          <div className="issueBody">
            <div className="issuePath">src/components/Modal.tsx</div>
            <ul className="issuePoints">
              <li>Faltam comentários JSDoc</li>
              <li>Sem descrição de props</li>
            </ul>
          </div>
        </div>

        <div className="issueCard">
          <div className="issueIcon">
            <img src={warning} alt="aviso" />
          </div>
          <div className="issueBody">
            <div className="issuePath">src/hooks/useApi.ts</div>
            <ul className="issuePoints">
              <li>Documentação incompleta de retorno</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
