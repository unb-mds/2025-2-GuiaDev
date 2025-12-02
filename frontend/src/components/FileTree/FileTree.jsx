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
          key={node.path || `${node.name}-${i}`}
          node={node}
          level={0}
          onFileClick={onFileClick}
          summary={summary}
        />
      ))}
    </div>
  );
}


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


function getProgress(node) {
  if (!node) return null;

  if (node.type === "file") {
    return parsePercent(node.meta && node.meta.badge);
  }

  const fromMeta = parsePercent(node.meta && node.meta.badge);
  if (fromMeta !== null) return fromMeta;

  if (!node.children || node.children.length === 0) return null;
  
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
           
            if (fromMeta) {
              return (
                <div className="node-meta">
                  <span className="node-badge">{fromMeta}</span>
                </div>
              );
            }
            return null;
          })()}

  
        {node.type === "file" && node.meta && node.meta.doc && (
          <div className="node-status-wrap">
            {(() => {
              const doc = node.meta.doc;
              const score = typeof doc?.score === "number" ? Math.round(doc.score) : null;

              const isComplete = score !== null && score >= 100;
              const isPartial = doc?.exists && score !== null && score !== 0 && score < 100;

              if (!isComplete && !isPartial) return null; 

              const label = isComplete ? "Completo" : "Parcial";
              const cls = isComplete ? "status Ativo" : "status Parcial";

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
                key={child.path || `${child.name}-${level + 1}-${i}`}
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
