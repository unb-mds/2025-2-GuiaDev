import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import "./MetricsRepo.css";
import accept from "./../../assets/accept.svg";
import docs from "./../../assets/docs.svg";
import warning from "./../../assets/warning.svg";
import clock from "./../../assets/clock.svg";


const MetricBoxRender = ({ name, num, icon }) => {
  return (
    <div className="metricBoxMetrics">
      <div className="nameMetrics">
        <span>{name}</span>
        <span>{icon}</span>
      </div>
      <div className="numMetrics">{num}</div>
    </div>
  );
};

function MetricsRepo({repoObj}) {

  const metrics = [];
  const loading = false;
  const error = null;

  const qtsDocs = Array.isArray(repoObj) ? repoObj : [];




  const totalDocs = qtsDocs.length;
  const existsCount = qtsDocs.filter((d) => d.exists === false).length;
  const location = useLocation();
   
  
  const commitsArr = (() => {
    if (repoObj && !Array.isArray(repoObj) && Array.isArray(repoObj.ultimosCommits) && repoObj.ultimosCommits.length) return repoObj.ultimosCommits;
    if (Array.isArray(repoObj) && repoObj.length && Array.isArray(repoObj[0]?.ultimosCommits) && repoObj[0].ultimosCommits.length) return repoObj[0].ultimosCommits;
    const st = location.state?.repo;
    if (st && Array.isArray(st.ultimosCommits) && st.ultimosCommits.length) return st.ultimosCommits;
    return null;
  })();


  const nameCommit = commitsArr && commitsArr.length ? commitsArr[0] : 'Sem commits';
  

  
  const [dataMetric, setData] = useState([]);

  useEffect(() => {
    const infos = [
      {
        id: "Metric-1",
        name: "Taxa de conclusão",
        num: "-",
        icon: <img src={accept} className="accept" />,
      },
      {
        id: "Metric-2",
        name: "Documentos",
        num: totalDocs,
        icon: <img src={docs} />,
      },
      {
        id: "Metric-3",
        name: "Arquivos Pendentes",
        num: existsCount,
        icon: <img src={warning} />,
      },
      {
        id: "Metric-4",
        name: "Último Commit",
        num: nameCommit,
        icon: <img src={clock} />,
      },
    ];

    if (loading || error || !metrics || metrics.length === 0) setData(infos);
    else setData(metrics);
  }, [loading, error, metrics, totalDocs, existsCount, nameCommit]);

  useEffect(() => {
  console.log('repoObj (debug):', repoObj);
}, [repoObj]);

  return (
    <div className="allComponentMetrics">
      {dataMetric.map((metric) => (
        <MetricBoxRender
          key={metric.id}
          name={metric.name}
          num={metric.num}
          icon={metric.icon}
        />
      ))}
    </div>
  );
}

export default MetricsRepo;
