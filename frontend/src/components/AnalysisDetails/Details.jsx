import React from "react";
import "./Details.css";
import FileTree from "../FileTree/FileTree";
import warning from "../../assets/warning.svg";
import demoTree from "../../mocks/tree.demo";

/*
  Quando o backend estiver pronto, descomente as linhas abaixo e remova a simulação.
  Os hooks já existem em `src/hooks` (useProjectTree / useProjectIssues).

  // import { useProjectTree } from '../../hooks/useProjectTree';
  // import { useProjectIssues } from '../../hooks/useProjectIssues';
  // const { tree, loading: treeLoading } = useProjectTree(projectId);
  // const { issues, loading: issuesLoading } = useProjectIssues(projectId);

  E então passe `tree` e `issues` para o JSX no lugar dos dados de simulação.
*/

const Details = () => {
  // Simulação local (mantida para desenvolvimento offline)
  const tree = demoTree;

  function handleFileClick(node) {
    // placeholder: daqui você pode abrir preview, navegar, etc.
    console.log("arquivo clicado:", node);
  }

  return (
    <div className="analysisDetails">
      <div className="structerProject">
        <h4>Estrutura de arquivos</h4>
        <FileTree tree={tree} onFileClick={handleFileClick} />
      </div>

      {/* Issues list inline - Arquivos com Problemas */}
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
