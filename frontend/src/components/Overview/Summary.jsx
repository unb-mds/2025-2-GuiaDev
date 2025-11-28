import React, { useEffect, useState } from "react";

import "./Summary.css";

const BoxDocsSummary = ({ name, status, score }) => {
  
  const statusClass =
    status === "Completo" ? "Ativo" : status === "Parcial" ? "Parcial" : "Desconectado";

  return (
    <div className="boxDocsSummary">
      <div className="summaryNames">{name}</div>
      <div className={`status ${statusClass}`}>
        {status}
      </div>
      
    </div>
  );
};

function Summary({repoObj}) {
 
  const summaryDocs = Array.isArray(repoObj) ? repoObj : [];

  return (
    <div className="summaryComponet">
      {summaryDocs.map((docs) => {
        const exists = docs.exists === true;
        const score = Number(docs.score) || 0;

        let statusText = exists ? 'Existe' : 'Pendente';
        if (exists) {
          if (score === 100) statusText = 'Completo';
          else if (score > 0) statusText = 'Parcial';
          else statusText = 'Existe';
        }

        return (
          <BoxDocsSummary
            key={docs.id ?? docs.name}
            name={docs.name}
            status={statusText}
            score={score}
          />
        );
      })}
    </div>
  );
}

export default Summary;
