import { useState } from "react";
import "./card.css";

export default function LearningCard({title, icon, expandedText}) {

    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () =>{
        setIsExpanded(!isExpanded);
    };

    const buttonText = isExpanded ? '-' : '+';

    return (
        
        <div className={`card-conteudo ${isExpanded ? 'expanded' : ''}`}>
            <div className="card-top">
                {icon &&
                    <span role="img" aria-label="ícone">{icon}</span>
                }
                <p className="título-Stories Maps">{title}</p>
            </div>
            <button 
                className="mais"
                onClick={toggleExpand}
                aria-expanded={isExpanded}
                aria-controls={`content-${title.replace(/\s/g, '-')}`}
            >
                {buttonText}
            </button>
            <div 
            className="card-expansivel"
            id={`content-${title.replace(/\s/g, '-')}`}
            >
                <p>{expandedText || "Conteúdo não especificado para este item."}</p>
            </div>
        </div>
    );

}