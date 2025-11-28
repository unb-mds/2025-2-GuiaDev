import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import api from "../../../services/api";
import "./Analysis.css";
import Overview from "../../components/Overview/Overview";
import MetricsRepo from "../../components/Overview/MetricsRepo";
import Summary from "../../components/Overview/Summary";
import Details from "../../components/AnalysisDetails/Details";
import { useParams, useLocation } from 'react-router-dom';

const AnalysisPage = () => {

  const params = useParams();        
  const location = useLocation();    

  const owner = params.owner;
  const repo = params.repo || location.state?.repo?.nomeRepositorio;
  const [repoObjt, setRepoObjt] = useState(null);

  const [selected, setSelected] = useState("general");
  const containerRef = useRef(null);
  const generalRef = useRef(null);
  const detailsRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  useLayoutEffect(() => {
    const update = () => {
      const target =
        selected === "general" ? generalRef.current : detailsRef.current;
      const container = containerRef.current;
      if (target && container) {
        const cRect = container.getBoundingClientRect();
        const tRect = target.getBoundingClientRect();
        setSliderStyle({
          left: tRect.left - cRect.left,
          top: tRect.top - cRect.top,
          width: tRect.width,
          height: tRect.height,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [selected]);


useEffect(() => {
  let alive = true;
  const fetchAnalysis = async () => {
    if (!owner || !repo) return;
    try {
      const res = await api.get(`github/analyze/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
      if (!alive) return;
      setRepoObjt(res?.data ?? null);
    } catch (err) {
      console.error('Erro ao buscar análise do repositório:', err);
      if (alive) setRepoObjt(null);
    }
  };

  fetchAnalysis();

  return () => { alive = false; };
}, [owner, repo]);

  return (
    <div className="page">
      <div className="namePage">
        Análise do Repositório
        <span className="subtitle">
          Visualize a documentação geral e detalhada do repositório!
        </span>
        <div className="changeModule" ref={containerRef}>
          <div
            className="slider"
            style={{
              transform: `translate(${sliderStyle.left}px, ${sliderStyle.top}px)`,
              width: sliderStyle.width,
              height: sliderStyle.height,
            }}
          />
          <div
            ref={generalRef}
            className={`generalVision ${selected === "general" ? "active" : ""
              }`}
            onClick={() => setSelected("general")}
          >
            Visão Geral
          </div>
          <div
            ref={detailsRef}
            className={`details ${selected === "details" ? "active" : ""}`}
            onClick={() => setSelected("details")}
          >
            Análise Detalhada
          </div>
        </div>
      </div>

      {selected == "general" ? (
        <div className="overview">
          <div className="firstSection">
            {/* <BoxComponent/> */}
            <span>
              <Overview repoObj={repoObjt}/>
            </span>
          </div>
          <div className="secondSection">
            <MetricsRepo repoObj={repoObjt}/>
          </div>
          <div className="thirdSection">
            <Summary repoObj={repoObjt}/>
          </div>
        </div>
      ) : (
        <Details repoObj={repoObjt}/>
      )}
    </div>
  );
};

export default AnalysisPage;
