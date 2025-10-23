import React, { useState } from "react";
import "./FileTree.css";
import folder from "./../../assets/folder.svg";
import docs from "./../../assets/docs.svg";
import chevron from "./../../assets/chevron-right.svg";
import { useSummary } from "../../hooks/useSummary";
import GitHubAPI from "../../../services/github";


export default function FileTree({
  tree = [],
  onFileClick,
  projectId,
  summary: summaryProp,
}) {
  // prefer hook when projectId provided, otherwise fall back to prop
  const { summary: summaryFromHook = [] } = useSummary(projectId || null);
  const summary =
    summaryProp && summaryProp.length ? summaryProp : summaryFromHook;

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

// helper: parse percent string like "85%" => 85, otherwise null
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

// compute aggregated progress for a node: if folder, average child progresses; if file, read meta.badge
function getProgress(node) {
  if (!node) return null;
  if (node.type === "file") {
    return parsePercent(node.meta && node.meta.badge);
  }
  // folder
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
        {/* optional badge + progress (for folders: prefer node.meta.badge else aggregated children) */}
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
            // fallback: show non-percent badge if present
            if (fromMeta) {
              return (
                <div className="node-meta">
                  <span className="node-badge">{fromMeta}</span>
                </div>
              );
            }
            return null;
          })()}

        {/* Status badge at the right: only for files. reuse Overview.css classes (.status.Ativo / .status.Parcial) */}
        {node.type === "file" && (
          <div className="node-status-wrap">
            {(() => {
              // try to find matching summary entry by path or name
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
