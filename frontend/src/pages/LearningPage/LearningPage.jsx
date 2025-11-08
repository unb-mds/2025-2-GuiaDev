import React, { useState } from 'react';
import './LearningPage.css';
import LearningCard from '../../components/LearningCard/Card';
import Chat from '../../components/Chat/Chat';

const ExplainDoc = ({ name, card }) => {
  // Two independent panels: Estrutura and Boas práticas
  const [openStructure, setOpenStructure] = useState(false);
  const [openPractices, setOpenPractices] = useState(false);

  return (
    <>
      {/* Estrutura panel */}
      <div className={`panel ${openStructure ? 'active' : ''}`}>
        <div className="estructureDocs">
          <button
            onClick={() => setOpenStructure(s => !s)}
            aria-expanded={openStructure}
          >
            <span>Estrutura do {name}</span>
          </button>
        </div>

        <div className="estructureDocs">
          {openStructure ? (
            <div className='contentLearning'>
              {card?.expandedText ? (
                <p>{card.expandedText}</p>
              ) : (
                <p>Conteúdo da estrutura do {name} (ex.: seções, títulos e exemplos).</p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Boas práticas panel */}
      <div className={`panel ${openPractices ? 'active' : ''}`}>
        <div className="estructureDocs">
          <button
            onClick={() => setOpenPractices(s => !s)}
            aria-expanded={openPractices}
          >
            <span>Boas práticas</span>
          </button>
        </div>

        <div className="estructureDocs">
          {openPractices ? (
            <div className='contentLearning'>
              <p>Conteúdo de boas práticas (ex.: convenções, exemplos e recomendações).</p>
              {card?.expandedText && (
                <p className='note'>Dica: {card.expandedText}</p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

const MockIcon = ({ children }) => <>{children}</>;

export default function LearningPage() {
  const [docs] = useState([{ id: 1, name: 'README' }]);
  const [selectedCard, setSelectedCard] = useState(null);

  const cardData = [
    { title: 'Stories Maps', icon: <MockIcon>📊</MockIcon>, expandedText: 'Introdução aos Stories Maps e sua aplicação em projetos front-end' },
    { title: 'CODE_OF_CONDUCT.md', expandedText: 'Diretrizes de comportamento para a comunidade GuiaDev. Leia antes de contribuir.' },
    { title: 'CHANGELOG.md', expandedText: 'Histórico de todas as mudanças e novas funcionalidades do projeto.' },
    { title: 'CONTRIBUTING.md', expandedText: 'Guia completo para quem deseja fazer contribuições ao código.' },
    { title: '.gitignore', expandedText: 'Lista de arquivos e pastas que o Git deve ignorar ao fazer um commit.' },
    { title: 'README.md', expandedText: 'Ponto de partida do projeto, contém informações essenciais e instalação.' },
    { title: 'SUPPORT.md', expandedText: 'Informações sobre como obter suporte ou reportar problemas.' },
    { title: 'SECURITY.md', expandedText: 'Política de segurança e como relatar vulnerabilidades de forma responsável.' },
    { title: 'GOVERNANCE.md', expandedText: 'Estrutura de governança e tomada de decisões do projeto.' },
    { title: 'Testes/CI', expandedText: 'Documentação sobre a suíte de testes e o pipeline de Integração Contínua (CI).' },
    { title: 'docs/', expandedText: 'Pasta que contém toda a documentação adicional do projeto.' },
  ];


  const handleDoc = () =>{
    
  }

  return (
    <div className='renderPage'>
      <div className='textTitle'>
        <p>Aprendizado</p>
        <p className='subtitle'>Boas práticas de documentação de projetos de software</p>
      </div>

      <div className='learningPage'>
        <div className='test'>
          <div className="learning">
            {cardData.map((data, index) => (
              <LearningCard
                key={index}
                title={data.title}
                icon={data.icon}
                expandedText={data.expandedText}
                onSelect={(card) => setSelectedCard(card)}
                selected={selectedCard?.title === data.title}
              />
            ))}
          </div>

          <div className='docsExplain'>
            <div className='titleBox'>Conteúdo Detalhado</div>
            <div className='boxDocsLearning'>
              {selectedCard ? (
                <ExplainDoc key={selectedCard.title} name={selectedCard.title} card={selectedCard} />
              ) : (
                <div className='placeholder'>Selecione um card à esquerda para ver os detalhes.</div>
              )}
            </div>
          </div>
        </div>

        <div className='chat-container'>
          <Chat />
        </div>
      </div>
    </div>
  );
}