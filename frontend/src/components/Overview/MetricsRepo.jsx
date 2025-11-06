import React, { useEffect, useState } from "react";
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

function MetricsRepo() {
  // projectId pode vir de props/rota; deixei 'demo' enquanto backend não existir
  const projectId = "demo";
  const metrics = [];
  const loading = false;
  const error = null;

  // fallback (dados de simulação) para desenvolvimento offline
  const [dataMetric, setData] = useState([]);

  useEffect(() => {
    const infos = [
      {
        id: "Metric-1",
        name: "Taxa de conclusão",
        num: "85%",
        icon: <img src={accept} className="accept" />,
      },
      {
        id: "Metric-2",
        name: "Documentos",
        num: "38",
        icon: <img src={docs} />,
      },
      {
        id: "Metric-3",
        name: "Arquivos Pendentes",
        num: "7",
        icon: <img src={warning} />,
      },
      {
        id: "Metric-4",
        name: "Última Atualização",
        num: "2 dias atrás",
        icon: <img src={clock} />,
      },
    ];

    // Uso os dados do backend quando disponíveis; caso contrário, mantenho o mock
    if (loading || error || !metrics || metrics.length === 0) setData(infos);
    else setData(metrics);
  }, [loading, error, metrics]);

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
