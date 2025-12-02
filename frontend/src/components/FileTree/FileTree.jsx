import React, { useState } from "react";
import "./FileTree.css";
import folder from "./../../assets/folder.svg";
import docs from "./../../assets/docs.svg";
import chevron from "./../../assets/chevron-right.svg";


export default function FileTree({
  tree = [],
  onFileClick,
  projectId,
  summary: summaryProp,
}) {

  const summary = summaryProp && summaryProp.length ? summaryProp : [];

  return (
    <div className="file-tree">
      {tree.map((node, i) => (
        <TreeNode
          key={node.name + i}
          node={node}
          level={0}
          onFileClick={onFileClick}
          summary={summary}
        />
      ))}
    </div>
  );
}

// Converte um valor para porcentagem (aceita número ou string com '%')
function parsePercent(value) {
  if (!value) return null;
  if (typeof value === "number")
    return Math.max(0, Math.min(100, Math.round(value)));
  if (typeof value === "string" && value.trim().endsWith("%")) {
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? null : Math.max(0, Math.min(100, n));
  }
  return null;
}

// Calcula progresso: arquivos usam node.meta.badge; pastas usam badge próprio ou média dos filhos
function getProgress(node) {
  if (!node) return null;
  // se for arquivo, retorna o badge (se houver)
  if (node.type === "file") {
    return parsePercent(node.meta && node.meta.badge);
  }
  // se for pasta, prefira o badge da própria pasta
  const fromMeta = parsePercent(node.meta && node.meta.badge);
  if (fromMeta !== null) return fromMeta;
  // se não houver filhos, não há progresso
  if (!node.children || node.children.length === 0) return null;
  // calcula média apenas com valores válidos
  const childValues = node.children
    .map(getProgress)
    .filter((v) => v !== null && v !== undefined);
  if (childValues.length === 0) return null;
  const sum = childValues.reduce((a, b) => a + b, 0);
  return Math.round(sum / childValues.length);
}

function TreeNode({ node, level, onFileClick, summary = [] }) {
  const [open, setOpen] = useState(false);
  const isFolder = node.type === "folder";

  function handleToggle(e) {
    e.stopPropagation();
    setOpen((v) => !v);
  }

  function handleClick(e) {
    e.stopPropagation();
    if (!isFolder && typeof onFileClick === "function") onFileClick(node);
    if (isFolder) setOpen((v) => !v);
  }

  return (
    <div
      className={`tree-node ${isFolder ? "folder" : "file"}`}
      style={{ paddingLeft: 12 * level }}
      onClick={handleClick}
    >
      <div className="node-row">
        {isFolder ? (
          <button
            className={`chev ${open ? "open" : ""}`}
            onClick={handleToggle}
            aria-label={open ? "Fechar pasta" : "Abrir pasta"}
          >
            <img src={chevron} alt="" />
          </button>
        ) : (
          <span className="file-dot" />
        )}

        <div className="sectionFolder">
          <span>
            <img src={isFolder ? folder : docs} className="iconFolder" />
          </span>
          <span className="node-name">{node.name}</span>
        </div>
        {/* Badge e barra de progresso: pastas usam node.meta.badge ou média dos filhos */}
        {isFolder &&
          (() => {
            const fromMeta = node.meta && node.meta.badge;
            const metaPct = parsePercent(fromMeta);
            const agg = getProgress(node);
            const pct = metaPct !== null ? metaPct : agg !== null ? agg : null;
            if (pct !== null) {
              return (
                <div className="node-meta">
                  <div
                    className="progress"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      className="progress-fill"
                      style={{ width: pct + "%" }}
                    />
                  </div>
                  <span className="node-percent">{pct}%</span>
                </div>
              );
            }
            // fallback: mostra badge de texto se existir
            if (fromMeta) {
              return (
                <div className="node-meta">
                  <span className="node-badge">{fromMeta}</span>
                </div>
              );
            }
            return null;
          })()}

        {/* Badge de status à direita: só para arquivos. usa classes .status.Ativo / .status.Parcial */}
        {node.type === "file" && (
          <div className="node-status-wrap">
            {(() => {
              // procura no resumo por entrada que combine por path ou nome
              const match =
                summary &&
                summary.find((s) => {
                  if (!s) return false;
                  if (s.path && node.path) return s.path === node.path;
                  if (s.name) return s.name === node.name;
                  return false;
                });

              const pctFromMeta = parsePercent(node.meta && node.meta.badge);
              const pctAgg = getProgress(node);
              const pct =
                pctFromMeta !== null
                  ? pctFromMeta
                  : pctAgg !== null
                    ? pctAgg
                    : null;

              const statusFromSummary =
                match && (match.status || match.state || match.result);
              const isComplete = (() => {
                if (typeof statusFromSummary === "string") {
                  const s = statusFromSummary.toLowerCase();
                  return (
                    s === "completo" ||
                    s === "complete" ||
                    s === "done" ||
                    s === "finished"
                  );
                }
                if (typeof pct === "number") return pct >= 100;
                return false;
              })();

              const label = isComplete ? "Completo" : "Parcial";
              const cls = isComplete ? "status Ativo" : "status Parcial"; // classes from Overview.css

              return (
                <div className={cls} aria-hidden>
                  <span className="status-label">{label}</span>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {isFolder && (
        <div className={`children ${open ? "open" : ""}`}>
          {node.children &&
            node.children.map((child, i) => (
              <TreeNode
                key={child.name + i}
                node={child}
                level={level + 1}
                onFileClick={onFileClick}
              />
            ))}
        </div>
      )}
    </div>
  );
}
