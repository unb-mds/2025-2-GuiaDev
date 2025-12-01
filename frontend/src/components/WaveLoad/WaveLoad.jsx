import { useRef, useState, useEffect } from "react";
import "./WaveLoad.css"

const LoadingWave = ({ owner }) => {
  const containerRef = useRef(null);
  const [barsMax, setBarsMax] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [waveCount, setWaveCount] = useState(5);

  const animationDuration = 500; 

  const staggerDelay = 50;       

  const pauseBetweenCycles = 400; 


  const barWidth = 6;
  const gap = 5.5;

  const computeBarsMax = () => {
    if (!containerRef.current) return 0;
    const containerWidth = containerRef.current.offsetWidth;
    return Math.max(0, Math.floor(containerWidth / (barWidth + gap)));
  };

  useEffect(() => {
    const update = () => setBarsMax(computeBarsMax());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (barsMax === 0) return;

    let timerDisplay;
    let timerReset;

    const runWaveCycle = () => {
   
      const travelTime = barsMax * staggerDelay;
      
     
      const calculatedWaves = Math.ceil(travelTime / animationDuration) + 3;
      
      setWaveCount(calculatedWaves);
      setIsRunning(true);

      const lastBarStartDelay = barsMax * staggerDelay;
      const totalAnimationDuration = animationDuration * calculatedWaves;
      const totalCycleTime = lastBarStartDelay + totalAnimationDuration;

      timerReset = setTimeout(() => {
        setIsRunning(false);
        timerDisplay = setTimeout(() => {
          runWaveCycle();
        }, pauseBetweenCycles);
      }, totalCycleTime);
    };

    runWaveCycle();

    return () => {
      clearTimeout(timerDisplay);
      clearTimeout(timerReset);
    };
  }, [barsMax]); 

  return (
    <div className="loading-component">
      <span className="search-msg">
        <p>Buscando repositórios de "{owner}"...</p>
      </span>
      
      <div 
        className={`wave-container ${isRunning ? 'running' : ''}`} 
        ref={containerRef}
        style={{ 
          '--wave-count': waveCount,

          '--anim-duration': `${animationDuration}ms` 
        }} 
      >
        {Array.from({ length: barsMax }).map((_, index) => (
          <div 
            key={index} 
            className="wave-bar"
            style={{ animationDelay: `${index * (staggerDelay / 1000)}s` }} 
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingWave;