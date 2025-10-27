import React, { useEffect, useState } from "react";

import "./Summary.css";

const BoxDocsSummary = ({ name, status }) => {
  return (
    <div className="boxDocsSummary">
      <div className="summaryNames">{name}</div>
      <div
        className={`status ${
          status === "Completo"
            ? "Ativo"
            : status === "Parcial"
            ? "Parcial"
            : "Desconectado"
        }`}
      >
        {status}
      </div>
      {/* css vindo do overview.css */}
    </div>
  );
};

function Summary() {
  // projectId and hook
  const projectId = "demo";
  const summary = [];
  const loading = false;
  const error = null;

  const [summaryDocs, setDocs] = useState([]);

  useEffect(() => {
    const dataSummary = [
      { id: "summaryDocs-a", name: "Docs_A.md", status: "Completo" },
      { id: "summaryDocs-b", name: "Docs_B.md", status: "Parcial" },
      { id: "summaryDocs-c", name: "Docs_C.md", status: "Pendente" },
      { id: "summaryDocs-d", name: "Docs_D.md", status: "Completo" },
    ];

    if (loading || error || !summary || summary.length === 0)
      setDocs(dataSummary);
    else setDocs(summary);
  }, [loading, error, summary]);

  return (
    <div className="summaryComponet">
      {summaryDocs.map((docs) => (
        <BoxDocsSummary key={docs.id} name={docs.name} status={docs.status} />
      ))}
    </div>
  );
}

export default Summary;
